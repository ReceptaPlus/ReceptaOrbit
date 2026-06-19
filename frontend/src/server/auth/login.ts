"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "@/modules/auth/schemas";
import type { SessionRole } from "@/types/domain";
import { db } from "@/server/db";
import { verifyPassword } from "./password";
import { createSession, destroySession } from "./session";

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
  const user = await db.user.findUnique({ where: { email } });

  // Mensagem genérica em todos os casos (não revela se o e-mail existe).
  if (!user || !user.passwordHash) {
    return { error: "Usuário ou senha incorretos." };
  }
  if (user.status !== "ACTIVE") {
    return { error: "Conta suspensa. Fale com o suporte." };
  }

  const ok = await verifyPassword(user.passwordHash, parsed.data.password);
  if (!ok) {
    return { error: "Usuário ou senha incorretos." };
  }

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

  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  await createSession({
    userId: user.id,
    pharmacyId,
    role,
    sessionVersion: user.sessionVersion,
    onboardingRequired: user.mustChangePassword || (!membership && !staff),
  });

  // Staff (sem farmácia) vai pro /admin; membros vão pro dashboard do tenant.
  redirect(membership ? "/dashboard" : staff ? "/admin" : "/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
