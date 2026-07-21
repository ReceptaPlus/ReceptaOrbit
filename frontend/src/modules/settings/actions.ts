"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { getAuthorizedPharmacyContext } from "@/server/auth/dal";
import { can } from "@/modules/tenancy/authz";
import { writeAudit } from "@/server/audit";
import { UF_CODES } from "@/lib/geo/uf";
import { pharmacySchema } from "./schemas";

/* Ações de Configurações do tenant. Contexto de farmácia validado server-side;
   RBAC por can() (edit_pharmacy = MANAGER+). Toda alteração gera auditoria antes→depois. */

export interface PharmacyFormState {
  error?: string;
  ok?: boolean;
}

export async function updatePharmacyAction(
  _prev: PharmacyFormState,
  formData: FormData,
): Promise<PharmacyFormState> {
  const ctx = await getAuthorizedPharmacyContext();
  if (!can("edit_pharmacy", ctx.role)) {
    return { error: "Sem permissão para editar os dados da farmácia." };
  }

  const parsed = pharmacySchema.safeParse({
    tradeName: formData.get("tradeName"),
    legalName: formData.get("legalName"),
    cnpj: formData.get("cnpj"),
    timezone: formData.get("timezone"),
    city: formData.get("city") ?? undefined,
    uf: formData.get("uf") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  // Município/UF são opcionais na edição: vazio → null. UF (se preenchida) precisa ser válida.
  const city = parsed.data.city?.trim() ? parsed.data.city.trim() : null;
  const uf = parsed.data.uf?.trim() ? parsed.data.uf.trim().toUpperCase() : null;
  if (uf && !UF_CODES.includes(uf)) return { error: "Selecione uma UF válida." };

  const before = await db.pharmacy.findUnique({
    where: { id: ctx.pharmacyId },
    select: { tradeName: true, legalName: true, cnpj: true, timezone: true, city: true, uf: true },
  });

  try {
    const after = await db.pharmacy.update({
      where: { id: ctx.pharmacyId },
      data: {
        tradeName: parsed.data.tradeName,
        legalName: parsed.data.legalName,
        cnpj: parsed.data.cnpj,
        timezone: parsed.data.timezone,
        city,
        uf,
      },
      select: { tradeName: true, legalName: true, cnpj: true, timezone: true, city: true, uf: true },
    });
    await writeAudit({
      pharmacyId: ctx.pharmacyId,
      actorUserId: ctx.userId,
      action: "PHARMACY_UPDATED",
      entityType: "Pharmacy",
      entityId: ctx.pharmacyId,
      before: before ?? undefined,
      after,
    });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") return { error: "CNPJ já cadastrado em outra farmácia." };
    return { error: "Falha ao salvar as alterações." };
  }

  revalidatePath("/configuracoes/farmacia");
  return { ok: true };
}
