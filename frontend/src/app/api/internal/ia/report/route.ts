import { authorizeIaRequest } from "@/server/ia/secret";
import { reportBodySchema } from "@/server/ia/schemas";
import { saveSalesReport } from "@/server/ia/queries";

/* POST /api/internal/ia/report
   Body: ReportBody (snapshot + narrativa). Valida com Zod e grava SalesReport
   (append-only por período). Auth: x-ia-secret (plataforma). */

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

  const parsed = reportBodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "validation", issues: parsed.error.flatten() }, { status: 422 });
  }

  try {
    const id = await saveSalesReport(parsed.data);
    return Response.json({ ok: true, id });
  } catch {
    return Response.json({ ok: false, error: "unknown pharmacy" }, { status: 409 });
  }
}
