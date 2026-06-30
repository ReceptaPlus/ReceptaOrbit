import { Algorithm, hash, verify } from "@node-rs/argon2";
import { env } from "../../config/env.js";

/* Hash de senha com Argon2id (OWASP defaults). Pepper aplicado antes do hash;
   nunca armazenar senha em texto, nunca logar. */
const OPTIONS = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashPassword(plain: string): Promise<string> {
  return hash(env.PASSWORD_PEPPER + plain, OPTIONS);
}

/* Verifica com o pepper primário; se falhar, tenta o anterior (PASSWORD_PEPPER_OLD) —
   permite rotacionar o pepper sem invalidar os hashes existentes. */
export async function verifyPassword(passwordHash: string, plain: string): Promise<boolean> {
  if (await verify(passwordHash, env.PASSWORD_PEPPER + plain, OPTIONS)) return true;
  if (env.PASSWORD_PEPPER_OLD && (await verify(passwordHash, env.PASSWORD_PEPPER_OLD + plain, OPTIONS))) return true;
  return false;
}
