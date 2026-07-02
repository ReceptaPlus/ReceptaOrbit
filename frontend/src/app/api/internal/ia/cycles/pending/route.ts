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

  const raw = Number(new URL(req.url).searchParams.get("limit"));
  const limit = Number.isFinite(raw) && raw > 0 ? Math.min(Math.floor(raw), MAX_LIMIT) : DEFAULT_LIMIT;

  const cycles = await fetchPendingCycles(limit);
  return Response.json({ ok: true, count: cycles.length, cycles });
}
