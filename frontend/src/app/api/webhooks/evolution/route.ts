import { db } from "@/server/db";
import { getWebhookSecret } from "@/server/evolution/config";

/* Webhook da Evolution (ingestão V1).
   Contrato: responde RÁPIDO (202), grava o payload BRUTO em webhook_events (fila
   durável) e NÃO processa nada aqui — o worker consome. Resolve o tenant pelo nome
   da instância (best-effort; se não achar, grava com pharmacyId null e o worker tenta).
   Segurança: se EVOLUTION_WEBHOOK_SECRET estiver setado, exige ?secret= ou header. */

export const runtime = "nodejs"; // Prisma precisa de runtime Node
export const dynamic = "force-dynamic";

function unauthorized() {
  return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

export async function POST(req: Request) {
  const secret = getWebhookSecret();
  if (secret) {
    const url = new URL(req.url);
    const provided = url.searchParams.get("secret") ?? req.headers.get("x-webhook-secret");
    if (provided !== secret) return unauthorized();
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    // Payload inválido: aceita (202) p/ a Evolution não ficar re-tentando, mas registra como FAILED.
    await db.webhookEvent.create({
      data: { payload: {}, status: "FAILED", error: "body não-JSON" },
    });
    return Response.json({ ok: true }, { status: 202 });
  }

  const instanceName: string | null = payload?.instance ?? null;
  const eventType: string | null = payload?.event ?? null;

  // Resolve tenant pelo nome da instância (best-effort).
  let pharmacyId: string | null = null;
  if (instanceName) {
    const conn = await db.whatsAppConnection.findUnique({
      where: { instanceName },
      select: { pharmacyId: true },
    });
    pharmacyId = conn?.pharmacyId ?? null;
  }

  await db.webhookEvent.create({
    data: {
      pharmacyId,
      instanceName,
      eventType,
      payload,
      status: "PENDING",
    },
  });

  return Response.json({ ok: true }, { status: 202 });
}

// Healthcheck simples (útil pra validar o deploy da rota).
export async function GET() {
  return Response.json({ ok: true, service: "evolution-webhook" });
}
