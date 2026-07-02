/* Rate limiter simples em memória (sliding fixed-window por chave).
   ⚠️ Por-instância: reseta no deploy e não compartilha entre réplicas. É
   defesa-em-profundidade p/ V1 single-instance; para escala, trocar por Redis. */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 10_000; // teto p/ não crescer indefinidamente

export interface RateResult {
  ok: boolean;
  retryAfterSec: number;
}

/** Conta uma tentativa em `key`. Bloqueia quando passa de `max` na janela `windowMs`. */
export function hitRateLimit(key: string, max: number, windowMs: number): RateResult {
  const now = Date.now();

  // prune oportunista quando o mapa cresce
  if (buckets.size > MAX_KEYS) {
    for (const [k, b] of buckets) if (now > b.resetAt) buckets.delete(k);
  }

  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  b.count += 1;
  if (b.count > max) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((b.resetAt - now) / 1000)) };
  }
  return { ok: true, retryAfterSec: 0 };
}

/** Limpa o contador de `key` (ex.: após login bem-sucedido). */
export function clearRateLimit(key: string): void {
  buckets.delete(key);
}
