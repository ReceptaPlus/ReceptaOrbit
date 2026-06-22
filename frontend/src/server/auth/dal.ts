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

/* Modo demo local (sem DATABASE_URL): sessão fixa, sem login/Postgres.
   IMPORTANTE (RBAC/multi-tenancy): o demo apenas ESCOLHE qual identidade está logada;
   toda autorização continua server-side via can() com o role da sessão. Por padrão,
   entra como OWNER de uma farmácia (usuário TENANT — NÃO tem acesso a /admin).
   Para inspecionar a área da plataforma, rode com DEMO_AS=admin → identidade de
   plataforma (PLATFORM_ADMIN, sem farmácia). NÃO confiar no front: o gate é o can(). */
const DEMO = !process.env.DATABASE_URL;
const DEMO_AS_ADMIN = process.env.DEMO_AS === "admin";
const DEMO_SESSION: SessionPayload = DEMO_AS_ADMIN
  ? {
      userId: "usr_antonio",
      pharmacyId: null,
      role: "PLATFORM_ADMIN",
      sessionVersion: 1,
      onboardingRequired: false,
    }
  : {
      userId: "usr_camila",
      pharmacyId: "pha_dsp",
      role: "OWNER",
      sessionVersion: 1,
      onboardingRequired: false,
    };

/** Apenas decodifica o cookie (sem DB). Use quando só precisa dos claims. */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  if (DEMO) return DEMO_SESSION;
  return decryptSession(await readSessionToken());
});

/** Sessão válida E não-revogada (confere sessionVersion/status no banco). */
export const requireSession = cache(async (): Promise<SessionPayload> => {
  if (DEMO) return DEMO_SESSION;
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
  if (DEMO) {
    // Identidade de plataforma não tem contexto de tenant → vai pro /admin (igual ao real).
    if (!DEMO_SESSION.pharmacyId) redirect("/admin");
    return { userId: DEMO_SESSION.userId, pharmacyId: DEMO_SESSION.pharmacyId, role: DEMO_SESSION.role as TenantRole };
  }
  const session = await requireSession();
  if (!session.pharmacyId) {
    // Staff (sem farmácia) não tem contexto de tenant — manda pro /admin (evita loop /login).
    const staff = await db.platformStaff.findUnique({ where: { userId: session.userId }, select: { userId: true } });
    redirect(staff ? "/admin" : "/login");
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
