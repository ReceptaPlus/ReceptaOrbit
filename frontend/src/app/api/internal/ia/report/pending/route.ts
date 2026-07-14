import { authorizeIaRequest } from "@/server/ia/secret";
import { fetchReportInputs } from "@/server/ia/queries";

/* GET /api/internal/ia/report/pending?days=7
   Snapshot de métricas por farmácia (vendas × conversas) para o n8n só escrever a
   narrativa e devolver em POST report. Auth: x-ia-secret (plataforma). */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = authorizeIaRequest(req);
  if (!auth.ok) return Response.json({ ok: false, error: auth.error }, { status: auth.status });

  const url = new URL(req.url);
  const raw = Number(url.searchParams.get("days"));
  const days = Number.isFinite(raw) && raw > 0 ? Math.min(Math.floor(raw), 90) : 7;
  // Escopo por tenant quando disparado no login; vazio = todas (retrocompatível com cron).
  const pharmacyId = url.searchParams.get("pharmacyId")?.trim() || undefined;

  const reports = await fetchReportInputs(days, pharmacyId);
  return Response.json({ ok: true, count: reports.length, reports });
}
