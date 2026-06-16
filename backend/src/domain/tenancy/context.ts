import type { TenantRole } from "@prisma/client";
import { prisma } from "../../db/client.js";

/* Resolução do contexto de tenant SERVER-SIDE. pharmacyId NUNCA é confiado a
   partir do request — é validado contra um Membership ATIVO do usuário.
   Toda consulta tenant-owned deve receber um PharmacyContext, nunca um pharmacyId cru. */
export class TenantAccessError extends Error {
  constructor(message = "Acesso negado a esta farmácia.") {
    super(message);
    this.name = "TenantAccessError";
  }
}

export interface PharmacyContext {
  userId: string;
  pharmacyId: string;
  role: TenantRole;
}

export async function resolvePharmacyContext(
  userId: string,
  pharmacyId: string,
): Promise<PharmacyContext> {
  const membership = await prisma.membership.findUnique({
    where: { pharmacyId_userId: { pharmacyId, userId } },
  });
  if (!membership || membership.status !== "ACTIVE") {
    throw new TenantAccessError();
  }
  return { userId, pharmacyId, role: membership.role };
}
