import "server-only";
import { hash, verify } from "@node-rs/argon2";

/* Hash/verify de senha (Argon2id — algoritmo padrão do @node-rs/argon2; não usamos
   o const enum Algorithm por causa de isolatedModules do Next). Espelha
   backend/src/domain/auth/password.ts. ⚠️ PASSWORD_PEPPER DEVE ser idêntico onde
   hasheia (seed/admin/convite) e onde confere (login). verify deriva os params do hash. */
const OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

function pepper(): string {
  const p = process.env.PASSWORD_PEPPER;
  if (!p) throw new Error("PASSWORD_PEPPER ausente (defina em .env.local).");
  return p;
}

export function hashPassword(plain: string): Promise<string> {
  return hash(pepper() + plain, OPTIONS);
}

export function verifyPassword(passwordHash: string, plain: string): Promise<boolean> {
  return verify(passwordHash, pepper() + plain);
}
