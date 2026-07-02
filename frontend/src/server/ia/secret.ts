import "server-only";
import { timingSafeEqual } from "node:crypto";
import { hashToken } from "@/server/auth/tokens";

/* Auth dos endpoints internos de IA (/api/internal/ia/*).
   O n8n é o único chamador e roda CROSS-TENANT (varre todas as farmácias), então o
   segredo é de PLATAFORMA (IA_INGEST_SECRET), não por-tenant — diferente do webhook
   Digisac (segredo por-conexão). Comparação em tempo constante: faz SHA-256 dos dois
   lados (normaliza tamanho) e usa timingSafeEqual. Fail-closed em produção: sem o env,
   recusa (não autentica ninguém). Em dev segue sem checagem (conveniência). */

export type IaAuthResult = { ok: true } | { ok: false; status: 401 | 503; error: string };

function constantTimeEquals(provided: string, expected: string): boolean {
  const a = Buffer.from(hashToken(provided), "hex");
  const b = Buffer.from(hashToken(expected), "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Valida o header x-ia-secret (ou ?secret=) contra IA_INGEST_SECRET. */
export function authorizeIaRequest(req: Request): IaAuthResult {
  const expected = process.env.IA_INGEST_SECRET?.trim();
  if (!expected) {
    if (process.env.NODE_ENV === "production") {
      console.error("[ia] IA_INGEST_SECRET ausente em produção — recusando.");
      return { ok: false, status: 503, error: "ia secret not configured" };
    }
    return { ok: true }; // dev: conveniência
  }
  const url = new URL(req.url);
  const provided = req.headers.get("x-ia-secret") ?? url.searchParams.get("secret");
  if (!provided || !constantTimeEquals(provided, expected)) {
    return { ok: false, status: 401, error: "unauthorized" };
  }
  return { ok: true };
}
