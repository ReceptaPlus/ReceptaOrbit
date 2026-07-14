import { authorizeIaRequest } from "@/server/ia/secret";
import { fetchPendingCycles } from "@/server/ia/queries";

/* GET /api/internal/ia/cycles/pending?limit=20
   Lote de ciclos a analisar (CLOSED, sem análise). O n8n consome, classifica no nó
   Anthropic e devolve em POST cycles/results. Auth: x-ia-secret (plataforma). */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function GET(req: Request) {
  const auth = authorizeIaRequest(req);
  if (!auth.ok) return Response.json({ ok: false, error: auth.error }, { status: auth.status });

  const url = new URL(req.url);
  const raw = Number(url.searchParams.get("limit"));
  const limit = Number.isFinite(raw) && raw > 0 ? Math.min(Math.floor(raw), MAX_LIMIT) : DEFAULT_LIMIT;
  // Escopo por tenant quando disparado no login; vazio = todas (retrocompatível com cron).
  const pharmacyId = url.searchParams.get("pharmacyId")?.trim() || undefined;

  const cycles = await fetchPendingCycles(limit, pharmacyId);
  return Response.json({ ok: true, count: cycles.length, cycles });
}
