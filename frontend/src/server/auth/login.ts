"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { loginSchema } from "@/modules/auth/schemas";
import type { SessionRole } from "@/types/domain";
import { db } from "@/server/db";
import { verifyPassword, hashPassword } from "./password";
import { createSession, destroySession } from "./session";
import { hitRateLimit, clearRateLimit } from "@/lib/rate-limit";

const LOGIN_MAX = 10; // tentativas
const LOGIN_WINDOW_MS = 10 * 60 * 1000; // por 10 min, por IP+email

/* Login REAL: valida credencial contra o Postgres (Railway) com Argon2id, resolve
   papel/farmácia por Membership ativo (ou PlatformStaff), cria sessão JWT.
   pharmacyId NUNCA vem do form — é derivado do vínculo no banco. */

export interface LoginState {
  error?: string;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const email = parsed.data.email.trim().toLowerCase();

  // Rate limit anti-brute-force (por IP + email).
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const rlKey = `login:${ip}:${email}`;
  const rl = hitRateLimit(rlKey, LOGIN_MAX, LOGIN_WINDOW_MS);
  if (!rl.ok) {
    return { error: `Muitas tentativas. Aguarde ${Math.ceil(rl.retryAfterSec / 60)} min e tente de novo.` };
  }

  const user = await db.user.findUnique({ where: { email } });

  // Mensagem genérica em todos os casos (não revela se o e-mail existe).
  if (!user || !user.passwordHash) {
    return { error: "Usuário ou senha incorretos." };
  }
  if (user.status !== "ACTIVE") {
    return { error: "Conta suspensa. Fale com o suporte." };
  }

  const { ok, needsRehash } = await verifyPassword(user.passwordHash, parsed.data.password);
  if (!ok) {
    return { error: "Usuário ou senha incorretos." };
  }
  // Migração de pepper sem lockout: hash antigo confere via fallback → regrava com o primário.
  const rehash = needsRehash ? { passwordHash: await hashPassword(parsed.data.password) } : {};

  // Resolve contexto: 1º membership ativo; senão papel de plataforma (staff).
  const membership = await db.membership.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
  });
  const staff = membership ? null : await db.platformStaff.findUnique({ where: { userId: user.id } });

  let role: SessionRole;
  let pharmacyId: string | null;
  if (membership) {
    role = membership.role;
    pharmacyId = membership.pharmacyId;
  } else if (staff) {
    role = staff.role;
    pharmacyId = null;
  } else {
    role = "VIEWER";
    pharmacyId = null;
  }

  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date(), ...rehash } });

  clearRateLimit(rlKey); // sucesso zera o contador

  await createSession({
    userId: user.id,
    pharmacyId,
    role,
    sessionVersion: user.sessionVersion,
    onboardingRequired: user.mustChangePassword || (!membership && !staff),
  });

  // A análise de IA NÃO é disparada aqui: o gatilho vive na ENTRADA do app (dashboard layout),
  // travado por cooldown durável (24h/farmácia). Assim vale para login novo E sessão persistida
  // (JWT 7d) — dados atualizam ao usar o app, não só ao re-autenticar. Ver server/ia/trigger.ts.

  // Staff (sem farmácia) vai pro /admin; membros vão pro dashboard do tenant.
  redirect(membership ? "/dashboard" : staff ? "/admin" : "/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
