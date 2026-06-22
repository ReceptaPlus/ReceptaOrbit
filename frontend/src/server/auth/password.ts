import "server-only";

/* Hash/verify de senha (Argon2id — algoritmo padrão do @node-rs/argon2; não usamos
   o const enum Algorithm por causa de isolatedModules do Next). Espelha
   backend/src/domain/auth/password.ts. ⚠️ PASSWORD_PEPPER DEVE ser idêntico onde
   hasheia (seed/admin/convite) e onde confere (login). verify deriva os params do hash.

   NOTA: @node-rs/argon2 é binding nativo; importado de forma PREGUIÇOSA p/ que módulos
   que só referenciam (ex.: logoutAction no /admin) não quebrem em máquinas sem o binário
   nativo (modo demo). Só carrega quando hash/verify é realmente chamado. */
const OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

async function argon2() {
  return import("@node-rs/argon2");
}

function pepper(): string {
  const p = process.env.PASSWORD_PEPPER;
  if (!p) throw new Error("PASSWORD_PEPPER ausente (defina em .env.local).");
  return p;
}

export async function hashPassword(plain: string): Promise<string> {
  const { hash } = await argon2();
  return hash(pepper() + plain, OPTIONS);
}

export async function verifyPassword(passwordHash: string, plain: string): Promise<boolean> {
  const { verify } = await argon2();
  return verify(passwordHash, pepper() + plain);
}
