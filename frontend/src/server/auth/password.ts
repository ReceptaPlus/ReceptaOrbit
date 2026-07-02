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

/* Rotação de pepper SEM lockout: PASSWORD_PEPPER é o primário (hashes novos usam ele);
   PASSWORD_PEPPER_OLD (opcional) é o anterior, aceito só na verificação. Quando um login
   casa com o pepper antigo, needsRehash=true e o caller regrava o hash com o primário —
   os hashes migram sozinhos no próximo login de cada usuário. Some o OLD depois que todos migraram. */
function peppers(): { primary: string; fallbacks: string[] } {
  const primary = process.env.PASSWORD_PEPPER;
  if (!primary) throw new Error("PASSWORD_PEPPER ausente (defina em .env.local).");
  const old = process.env.PASSWORD_PEPPER_OLD?.trim();
  return { primary, fallbacks: old ? [old] : [] };
}

export async function hashPassword(plain: string): Promise<string> {
  const { hash } = await argon2();
  return hash(peppers().primary + plain, OPTIONS);
}

/** ok = senha confere; needsRehash = casou com um pepper antigo (caller deve regravar). */
export async function verifyPassword(
  passwordHash: string,
  plain: string,
): Promise<{ ok: boolean; needsRehash: boolean }> {
  const { verify } = await argon2();
  const { primary, fallbacks } = peppers();
  if (await verify(passwordHash, primary + plain)) return { ok: true, needsRehash: false };
  for (const old of fallbacks) {
    if (await verify(passwordHash, old + plain)) return { ok: true, needsRehash: true };
  }
  return { ok: false, needsRehash: false };
}
