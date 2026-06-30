import { authorizeIaRequest } from "@/server/ia/secret";
import { cycleResultsBodySchema } from "@/server/ia/schemas";
import { saveCycleResults } from "@/server/ia/queries";

/* POST /api/internal/ia/cycles/results
   Body: { results: CycleResult[] } (lote). Valida com Zod e faz upsert idempotente
   por (cycleId, pharmacyId). Auth: x-ia-secret (plataforma). */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = authorizeIaRequest(req);
  if (!auth.ok) return Response.json({ ok: false, error: auth.error }, { status: auth.status });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const parsed = cycleResultsBodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "validation", issues: parsed.error.flatten() }, { status: 422 });
  }

  try {
    const saved = await saveCycleResults(parsed.data.results);
    return Response.json({ ok: true, saved });
  } catch {
    // FK falha = cycleId/pharmacyId inexistente (ciclo de outro tenant ou já removido).
    return Response.json({ ok: false, error: "unknown cycle or tenant" }, { status: 409 });
  }
}
