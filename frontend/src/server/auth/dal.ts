import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { can } from "@/modules/tenancy/authz";
import type { Action, TenantRole } from "@/types/domain";
import { db } from "@/server/db";
import { decryptSession, readSessionToken, type SessionPayload } from "./session";

/* Data Access Layer de auth. Toda página/handler/action protegido passa por aqui.
   `cache` dedup a leitura por request. proxy faz só check otimista de cookie;
   AQUI é a verificação real (assinatura + revogação por sessionVersion). */

/** Apenas decodifica o cookie (sem DB). Use quando só precisa dos claims. */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  return decryptSession(await readSessionToken());
});

/** Sessão válida E não-revogada (confere sessionVersion/status no banco). */
export const requireSession = cache(async (): Promise<SessionPayload> => {
  const session = await getSession();
  if (!session) redirect("/login");

  // userId malformado (ex.: cookie antigo, não-UUID) → não consulta, evita erro/500.
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID.test(session.userId)) redirect("/login");

  let user: { sessionVersion: number; status: string } | null = null;
  try {
    user = await db.user.findUnique({
      where: { id: session.userId },
      select: { sessionVersion: true, status: true },
    });
  } catch {
    redirect("/login");
  }
  // Revogação: troca de senha/suspensão incrementa sessionVersion → invalida o cookie.
  if (!user || user.status !== "ACTIVE" || user.sessionVersion !== session.sessionVersion) {
    redirect("/login");
  }
  return session;
});

export interface PharmacyContext {
  userId: string;
  pharmacyId: string;
  role: TenantRole;
}

/** Contexto de tenant validado server-side. pharmacyId NUNCA vem do request —
   é o da sessão, conferido contra um Membership ATIVO no banco. */
export async function getAuthorizedPharmacyContext(): Promise<PharmacyContext> {
  const session = await requireSession();
  if (!session.pharmacyId) {
    // Staff (sem farmácia) não tem contexto de tenant — manda pro /admin (evita loop /login).
    const staff = await db.platformStaff.findUnique({ where: { userId: session.userId }, select: { userId: true } });
    redirect(staff ? "/admin" : "/login");
  }
  // Impersonação de suporte: staff assumiu este tenant (sem Membership). Revalida a cada
  // request que a conta AINDA é staff de plataforma antes de conceder o contexto — se o
  // vínculo de staff sumiu, a impersonação cai. Papel efetivo = o da sessão (MANAGER).
  if (session.impersonating) {
    const staff = await db.platformStaff.findUnique({ where: { userId: session.userId }, select: { userId: true } });
    if (!staff) redirect("/login");
    return { userId: session.userId, pharmacyId: session.pharmacyId, role: session.role as TenantRole };
  }
  const membership = await db.membership.findUnique({
    where: { pharmacyId_userId: { pharmacyId: session.pharmacyId, userId: session.userId } },
  });
  if (!membership || membership.status !== "ACTIVE") redirect("/login");
  return { userId: session.userId, pharmacyId: session.pharmacyId, role: membership.role };
}

/** Autorização server-side por ação. RBAC sempre aplicado (inclusive no demo). */
export async function requireCan(action: Action): Promise<SessionPayload> {
  const session = await requireSession();
  if (!can(action, session.role)) redirect("/dashboard");
  return session;
}
