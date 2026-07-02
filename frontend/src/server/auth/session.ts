import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { z } from "zod";
import { SESSION_COOKIE, SESSION_MAX_AGE_S } from "./constants";

/* Sessão JWT stateless (padrão recomendado pelo guia de autenticação do Next 16).
   Claims mínimos (docx §7): userId, role, sessionVersion, onboardingRequired + pharmacyId
   ativo. Cookie httpOnly/SameSite. Verificação real = DAL; proxy só faz check otimista. */

const ALG = "HS256";

function key(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET ausente ou fraco (defina em .env.local).");
  }
  return new TextEncoder().encode(secret);
}

const sessionSchema = z.object({
  userId: z.string().min(1),
  pharmacyId: z.string().min(1).nullable(),
  role: z.enum(["OWNER", "MANAGER", "VIEWER", "PLATFORM_ADMIN", "PLATFORM_SUPPORT"]),
  sessionVersion: z.number().int(),
  onboardingRequired: z.boolean(),
  // Suporte de plataforma assumindo um tenant (impersonação). Quando true, pharmacyId
  // aponta p/ a farmácia acessada e role é o papel EFETIVO dentro dela (MANAGER).
  impersonating: z.boolean().optional(),
});

export type SessionPayload = z.infer<typeof sessionSchema>;

export async function encryptSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key());
}

export async function decryptSession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: [ALG] });
    const parsed = sessionSchema.safeParse(payload);
    return parsed.success ? parsed.data : null;
  } catch {
    return null; // assinatura inválida / expirada
  }
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await encryptSession(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_S,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function readSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}
