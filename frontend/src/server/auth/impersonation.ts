"use server";

import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { requireCan, requireSession } from "@/server/auth/dal";
import { createSession } from "@/server/auth/session";
import type { AdminFormState } from "@/server/admin";

/* Impersonação de suporte: staff de plataforma (PLATFORM_ADMIN/SUPPORT) assume o contexto
   de um tenant p/ dar suporte. Reemite o cookie de sessão apontando p/ a farmácia com papel
   EFETIVO = MANAGER (acesso total, conforme decisão). Sair restaura a identidade de staff.
   Cada AÇÃO dentro do tenant continua auditada com actorUserId = o staff (via ctx.userId). */

export async function enterPharmacyAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const session = await requireCan("access_admin"); // só PLATFORM_ADMIN/SUPPORT chegam aqui
  const pharmacyId = String(formData.get("pharmacyId") ?? "");
  if (!pharmacyId) return { error: "Selecione a farmácia." };

  // Defesa extra: confirma o vínculo de staff no banco (não confia só no papel do cookie).
  const staff = await db.platformStaff.findUnique({ where: { userId: session.userId }, select: { userId: true } });
  if (!staff) return { error: "Apenas suporte de plataforma pode acessar contas." };

  const pharmacy = await db.pharmacy.findUnique({ where: { id: pharmacyId }, select: { id: true, tradeName: true } });
  if (!pharmacy) return { error: "Farmácia não encontrada." };

  const user = await db.user.findUnique({ where: { id: session.userId }, select: { sessionVersion: true } });

  await createSession({
    userId: session.userId,
    pharmacyId: pharmacy.id,
    role: "MANAGER", // papel efetivo dentro do tenant (acesso total)
    sessionVersion: user?.sessionVersion ?? session.sessionVersion,
    onboardingRequired: false,
    impersonating: true,
  });

  console.warn(`[impersonation] START staff=${session.userId} pharmacy=${pharmacy.id} "${pharmacy.tradeName}"`);
  redirect("/dashboard");
}

export async function exitImpersonationAction(): Promise<void> {
  const session = await requireSession();
  if (!session.impersonating) redirect("/admin");

  const staff = await db.platformStaff.findUnique({ where: { userId: session.userId }, select: { role: true } });
  const user = await db.user.findUnique({ where: { id: session.userId }, select: { sessionVersion: true } });

  await createSession({
    userId: session.userId,
    pharmacyId: null,
    role: staff?.role ?? "PLATFORM_SUPPORT",
    sessionVersion: user?.sessionVersion ?? session.sessionVersion,
    onboardingRequired: false,
    impersonating: false,
  });

  console.warn(`[impersonation] END staff=${session.userId}`);
  redirect("/admin");
}
