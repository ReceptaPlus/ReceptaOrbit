import { timingSafeEqual } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { hashToken } from "@/server/auth/tokens";

/* Webhook da Digisac (ingestão multicanal V1).
   Contrato IGUAL ao da Evolution: responde RÁPIDO (202), grava o payload BRUTO em
   webhook_events (fila durável) e NÃO processa nada — o worker consome.

   Diferenças vs Evolution:
   - Tenant é resolvido pelo serviceId (o canal) que vem no payload, casado contra
     ChannelConnection (provider=DIGISAC, externalId=serviceId).
   - Segredo é POR-TENANT (não global): cada conexão tem o seu, guardado só como
     SHA-256. Autentica comparando hash em tempo constante. Aceita header
     x-webhook-secret ou ?secret= (compat. com a config de webhook da conta Digisac).
   Sem conexão para o serviceId, ou segredo errado → 401 (não grava nada). */

export const runtime = "nodejs"; // Prisma precisa de runtime Node
export const dynamic = "force-dynamic";

function unauthorized() {
  return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

/* Compara o segredo recebido contra o hash guardado, em tempo constante. */
function secretMatchesHash(provided: string | null, expectedHash: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(hashToken(provided)); // hex do recebido
  const b = Buffer.from(expectedHash); // hex guardado
  return a.length === b.length && timingSafeEqual(a, b);
}

/* serviceId = identidade do canal na Digisac (chave de resolução do tenant).
   Defensivo: o payload é heterogêneo entre eventos/versões. */
function extractServiceId(payload: Record<string, unknown>): string | null {
  const data = (payload.data ?? {}) as Record<string, unknown>;
  const candidates = [
    data.serviceId,
    (data.service as Record<string, unknown> | undefined)?.id,
    payload.serviceId,
    data.accountId,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return null;
}

export async function POST(req: Request) {
  let payload: Prisma.InputJsonObject;
  try {
    payload = (await req.json()) as Prisma.InputJsonObject;
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const serviceId = extractServiceId(payload as Record<string, unknown>);
  if (!serviceId) return unauthorized(); // sem canal identificável: recusa

  const conn = await db.channelConnection.findUnique({
    where: { provider_externalId: { provider: "DIGISAC", externalId: serviceId } },
    select: { pharmacyId: true, webhookSecretHash: true, active: true },
  });
  if (!conn || !conn.active) return unauthorized(); // serviceId desconhecido/inativo

  const url = new URL(req.url);
  const provided = req.headers.get("x-webhook-secret") ?? url.searchParams.get("secret");
  if (!secretMatchesHash(provided, conn.webhookSecretHash)) return unauthorized();

  const eventType = typeof payload.event === "string" ? payload.event : null;

  await db.webhookEvent.create({
    data: {
      pharmacyId: conn.pharmacyId, // já resolvido (autenticado)
      provider: "DIGISAC",
      externalId: serviceId,
      eventType,
      payload,
      status: "PENDING",
    },
  });

  return Response.json({ ok: true }, { status: 202 });
}

// Healthcheck simples (validar o deploy da rota).
export async function GET() {
  return Response.json({ ok: true, service: "digisac-webhook" });
}
