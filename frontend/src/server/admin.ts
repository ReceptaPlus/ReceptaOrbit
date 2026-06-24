"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/server/db";
import { requireCan } from "@/server/auth/dal";
import { generateInviteToken } from "@/server/auth/tokens";
import { hashPassword } from "@/server/auth/password";
import { writeAudit } from "@/server/audit";

/* Senha temporária legível (10 chars, com letra E dígito; sem 0/O/1/l ambíguos). */
function generateTempPassword(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const all = letters + digits;
  const b = randomBytes(10);
  const pick = (set: string, n: number) => set[n % set.length];
  let out = pick(letters, b[0]) + pick(digits, b[1]);
  for (let i = 2; i < 10; i++) out += pick(all, b[i]);
  return out;
}

/* Ações de plataforma (staff). Gated por requireCan: só PLATFORM_ADMIN cria farmácia;
   manage_users vincula/convida. Toda criação gera auditoria. */

export interface AdminFormState {
  error?: string;
  ok?: boolean;
  inviteUrl?: string;
  tempPassword?: string;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

const pharmacySchema = z.object({
  tradeName: z.string().min(2, "Informe o nome fantasia"),
  legalName: z.string().min(2, "Informe a razão social"),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ no formato 00.000.000/0000-00"),
});

export async function createPharmacyAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const session = await requireCan("create_pharmacy");
  const parsed = pharmacySchema.safeParse({
    tradeName: formData.get("tradeName"),
    legalName: formData.get("legalName"),
    cnpj: formData.get("cnpj"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const slug = `${slugify(parsed.data.tradeName)}-${randomBytes(2).toString("hex")}`;
  try {
    const pharmacy = await db.pharmacy.create({ data: { ...parsed.data, slug } });
    await writeAudit({
      pharmacyId: pharmacy.id,
      actorUserId: session.userId,
      onBehalfOf: pharmacy.id,
      action: "PHARMACY_CREATED",
      entityType: "Pharmacy",
      entityId: pharmacy.id,
      after: { tradeName: pharmacy.tradeName, cnpj: pharmacy.cnpj },
    });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") return { error: "CNPJ já cadastrado." };
    return { error: "Falha ao criar farmácia." };
  }
  revalidatePath("/admin/farmacias");
  return { ok: true };
}

const inviteSchema = z.object({
  name: z.string().min(2, "Informe o nome"),
  email: z.string().email("E-mail inválido"),
  pharmacyId: z.string().min(1, "Selecione a farmácia"),
  role: z.enum(["MANAGER", "VIEWER"]),
});

export async function inviteUserAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  // Ação de PLATAFORMA: cria vínculo em pharmacyId arbitrário → exige access_admin
  // (manage_users sozinho permitiria a um MANAGER tenant convidar p/ outra farmácia).
  const session = await requireCan("access_admin");
  const parsed = inviteSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    pharmacyId: formData.get("pharmacyId"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const email = parsed.data.email.trim().toLowerCase();
  const user =
    (await db.user.findUnique({ where: { email } })) ??
    (await db.user.create({ data: { name: parsed.data.name, email, mustChangePassword: true } }));

  const existing = await db.membership.findUnique({
    where: { pharmacyId_userId: { pharmacyId: parsed.data.pharmacyId, userId: user.id } },
  });
  if (existing) return { error: "Usuário já vinculado a esta farmácia." };

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.membership.create({
    data: {
      pharmacyId: parsed.data.pharmacyId,
      userId: user.id,
      role: parsed.data.role,
      status: "INVITED",
      invitedByUserId: session.userId,
      inviteExpiresAt: expiresAt,
    },
  });

  const { token, tokenHash } = generateInviteToken();
  await db.userInvitation.create({
    data: { userId: user.id, tokenHash, expiresAt, createdByUserId: session.userId },
  });

  await writeAudit({
    pharmacyId: parsed.data.pharmacyId,
    actorUserId: session.userId,
    onBehalfOf: parsed.data.pharmacyId,
    action: "USER_INVITED",
    entityType: "User",
    entityId: user.id,
    after: { email, role: parsed.data.role },
  });

  revalidatePath("/admin/usuarios");

  // URL absoluta a partir do host do request (funciona em prod e local).
  const h = await headers();
  const host = h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = host ? `${proto}://${host}` : "";
  return { ok: true, inviteUrl: `${base}/convite/${token}` };
}

/* Vincula uma farmácia ao Client do Agente-Meta-Ads (resolve os cards de anúncio
   por id explícito). agenteClientId vazio = desvincular (volta ao fallback por nome). */
export async function setPharmacyAdsClientAction(formData: FormData): Promise<AdminFormState> {
  const session = await requireCan("access_admin");
  const pharmacyId = String(formData.get("pharmacyId") ?? "");
  const raw = String(formData.get("agenteClientId") ?? "").trim();
  const agenteClientId = raw === "" ? null : raw;
  if (!pharmacyId) return { error: "Farmácia inválida." };

  try {
    const pharmacy = await db.pharmacy.update({
      where: { id: pharmacyId },
      data: { agenteClientId },
      select: { id: true },
    });
    await writeAudit({
      pharmacyId: pharmacy.id,
      actorUserId: session.userId,
      onBehalfOf: pharmacy.id,
      action: "PHARMACY_UPDATED",
      entityType: "Pharmacy",
      entityId: pharmacy.id,
      after: { agenteClientId },
    });
  } catch {
    return { error: "Falha ao vincular o cliente de anúncios." };
  }
  revalidatePath("/admin/farmacias");
  revalidatePath("/dashboard");
  return { ok: true };
}

/* Exclui um usuário (a PESSOA) globalmente: remove todos os vínculos/convites/sessões
   por cascade. Só PLATFORM_ADMIN. Bloqueia auto-exclusão. Irreversível. */
export async function deleteUserAction(formData: FormData): Promise<AdminFormState> {
  const session = await requireCan("access_admin");
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return { error: "Usuário inválido." };
  if (userId === session.userId) return { error: "Você não pode excluir a própria conta." };

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });
  if (!user) return { error: "Usuário não encontrado." };

  try {
    await db.user.delete({ where: { id: userId } });
  } catch {
    return { error: "Falha ao excluir o usuário." };
  }
  // Ação de plataforma (sem pharmacyId único) — auditoria por tenant não se aplica.
  console.warn(`[admin] usuário excluído: id=${user.id} (por ${session.userId})`);
  revalidatePath("/admin/usuarios");
  return { ok: true };
}

/* Redefine a senha de um usuário para uma temporária (admin entrega ao cliente).
   Bump em sessionVersion invalida sessões antigas. Só PLATFORM_ADMIN.
   Retorna a senha em texto UMA vez (não é recuperável depois — só hash no banco). */
export async function resetUserPasswordAction(formData: FormData): Promise<AdminFormState> {
  const session = await requireCan("access_admin");
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return { error: "Usuário inválido." };

  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, email: true } });
  if (!user) return { error: "Usuário não encontrado." };

  const tempPassword = generateTempPassword();
  try {
    const passwordHash = await hashPassword(tempPassword);
    await db.user.update({
      where: { id: userId },
      data: { passwordHash, mustChangePassword: true, sessionVersion: { increment: 1 } },
    });
  } catch {
    return { error: "Falha ao redefinir a senha." };
  }
  console.warn(`[admin] senha redefinida: id=${user.id} (por ${session.userId})`);
  revalidatePath("/admin/usuarios");
  return { ok: true, tempPassword };
}
