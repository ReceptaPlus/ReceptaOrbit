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

export function verifyPassword(passwordHash: string, plain: string): Promise<boolean> {
  return verify(passwordHash, env.PASSWORD_PEPPER + plain, OPTIONS);
}
