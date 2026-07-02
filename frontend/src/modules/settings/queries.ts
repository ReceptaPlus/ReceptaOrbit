import "server-only";
import { db } from "@/server/db";
import { getAuthorizedPharmacyContext } from "@/server/auth/dal";
import { formatDate } from "@/lib/format";

/* Camada de dados real (Prisma) das Configurações do tenant. Escopo de farmácia
   garantido server-side via getAuthorizedPharmacyContext — pharmacyId NUNCA vem do
   request. Substitui o antigo settings/api.ts (mock). */

export type PharmacyUserRole = "OWNER" | "MANAGER" | "VIEWER";
export type PharmacyUserStatus = "INVITED" | "ACTIVE" | "SUSPENDED" | "REVOKED";

export interface PharmacyUserVM {
  id: string; // membership id
  name: string;
  email: string;
  role: PharmacyUserRole;
  status: PharmacyUserStatus;
  lastAccess: string; // formatado ou "—"
}

/** Usuários (memberships) da farmácia do tenant atual. */
export async function listPharmacyUsersVM(): Promise<PharmacyUserVM[]> {
  const { pharmacyId } = await getAuthorizedPharmacyContext();
  const memberships = await db.membership.findMany({
    where: { pharmacyId },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true, email: true } } },
  });
  return memberships.map((m) => ({
    id: m.id,
    name: m.user.name,
    email: m.user.email,
    role: m.role as PharmacyUserRole,
    status: m.status as PharmacyUserStatus,
    lastAccess: m.lastAccessAt ? formatDate(m.lastAccessAt.toISOString()) : "—",
  }));
}

export interface PharmacyVM {
  tradeName: string;
  legalName: string;
  cnpj: string;
  timezone: string;
}

/** Dados cadastrais da farmácia do tenant atual. */
export async function getPharmacyVM(): Promise<PharmacyVM> {
  const { pharmacyId } = await getAuthorizedPharmacyContext();
  return db.pharmacy.findUniqueOrThrow({
    where: { id: pharmacyId },
    select: { tradeName: true, legalName: true, cnpj: true, timezone: true },
  });
}

