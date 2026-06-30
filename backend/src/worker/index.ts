import "dotenv/config";
import { Prisma } from "@prisma/client";
import { prisma } from "../db/client.js";
import { ingestMessage } from "../domain/ingestion/ingest.js";
import { extractMessages, normalizeEventName } from "../domain/ingestion/evolution-payload.js";
import { extractMessagesDigisac } from "../domain/ingestion/digisac-payload.js";

/* Worker de ingestão (V1). Faz POLL da tabela webhook_events — ela É a fila durável/
   replayável (sem pg-boss na V1; entra quando o volume pedir).

   Robustez (não perder mensagem de WhatsApp):
   - CLAIM ATÔMICO: `FOR UPDATE SKIP LOCKED` marca o lote como PROCESSING numa transação,
     então 2 instâncias do worker NUNCA pegam o mesmo evento.
   - RETRY com backoff: falha transitória (timeout/restart de DB, blip de rede) reabre o
     evento como PENDING com next_retry_at futuro. Só vira FAILED (dead-letter) após
     MAX_ATTEMPTS ou em erro PERMANENTE (constraint/FK/registro ausente).
   - REAPER de crash: PROCESSING tem deadline de visibilidade (next_retry_at); se o worker
     morre no meio, o evento é revivido para PENDING.
   O dispatch é por provider; abaixo do ingestMessage tudo é agnóstico. */

const POLL_INTERVAL_MS = 3000;
const BATCH_SIZE = 25;
const MAX_ATTEMPTS = 5;
const BACKOFF_BASE_MS = 5_000; // 5s, 10s, 20s, 40s, ...
const BACKOFF_MAX_MS = 60 * 60 * 1000; // teto de 1h
const VISIBILITY_TIMEOUT_MS = 5 * 60 * 1000; // PROCESSING preso > 5min = crash → reabrir

let running = true;

interface ClaimedEvent {
  id: string;
  pharmacyId: string | null;
  provider: "EVOLUTION" | "DIGISAC";
  instanceName: string | null;
  externalId: string | null;
  payload: any;
  attempts: number;
}

/** Reivindica até BATCH_SIZE eventos PENDING vencidos, marcando-os PROCESSING de forma
    atômica (SKIP LOCKED). next_retry_at vira o deadline de visibilidade do PROCESSING. */
async function claimBatch(): Promise<ClaimedEvent[]> {
  const deadline = new Date(Date.now() + VISIBILITY_TIMEOUT_MS);
  return prisma.$queryRaw<ClaimedEvent[]>`
    UPDATE "webhook_events" SET "status" = 'PROCESSING', "next_retry_at" = ${deadline}
    WHERE "id" IN (
      SELECT "id" FROM "webhook_events"
      WHERE "status" = 'PENDING' AND ("next_retry_at" IS NULL OR "next_retry_at" <= now())
      ORDER BY "received_at" ASC
      LIMIT ${BATCH_SIZE}
      FOR UPDATE SKIP LOCKED
    )
    RETURNING "id",
              "pharmacy_id"   AS "pharmacyId",
              "provider",
              "instance_name" AS "instanceName",
              "external_id"   AS "externalId",
              "payload",
              "attempts";
  `;
}

/** Revive eventos presos em PROCESSING além do deadline de visibilidade (worker morreu). */
async function reapStalled(): Promise<void> {
  await prisma.$executeRaw`
    UPDATE "webhook_events" SET "status" = 'PENDING', "next_retry_at" = NULL
    WHERE "status" = 'PROCESSING' AND "next_retry_at" < now();
  `;
}

/** Erro PERMANENTE não deve ser re-tentado (vai direto pra dead-letter). */
function isPermanent(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return ["P2002", "P2003", "P2025"].includes(err.code); // unique / FK / registro ausente
  }
  if (err instanceof Prisma.PrismaClientValidationError) return true;
  return false;
}

/** Resolve o tenant (quando o webhook não resolveu): por instância (Evolution) ou
    por serviceId/externalId (Digisac, casado contra ChannelConnection ativa). */
async function resolvePharmacyId(event: ClaimedEvent): Promise<string | null> {
  if (event.pharmacyId) return event.pharmacyId;

  if (event.provider === "DIGISAC") {
    const ext = event.externalId ?? (event.payload as any)?.data?.serviceId;
    if (!ext) return null;
    const conn = await prisma.channelConnection.findUnique({
      where: { provider_externalId: { provider: "DIGISAC", externalId: String(ext) } },
      select: { pharmacyId: true, active: true },
    });
    return conn?.active ? conn.pharmacyId : null;
  }

  const inst = event.instanceName ?? (event.payload as any)?.instance;
  if (!inst) return null;
  const conn = await prisma.whatsAppConnection.findUnique({ where: { instanceName: String(inst) }, select: { pharmacyId: true } });
  return conn?.pharmacyId ?? null;
}

function mapConnectionState(state: unknown): "CONNECTED" | "DOWN" | "PAIRING" | null {
  const s = String(state ?? "").toLowerCase();
  if (s === "open") return "CONNECTED";
  if (s === "close" || s === "closed") return "DOWN";
  if (s === "connecting") return "PAIRING";
  return null;
}

async function handleConnectionUpdate(pharmacyId: string, payload: any): Promise<void> {
  const next = mapConnectionState(payload?.data?.state ?? payload?.state);
  if (!next) return;
  await prisma.whatsAppConnection.update({
    where: { pharmacyId },
    data: { state: next, stateChangedAt: new Date() },
  });
}

/** Faz o trabalho do evento. LANÇA em qualquer falha — quem decide retry/dead-letter
    é handleClaimed (tenant não resolvido é tratado como transitório: dá tempo do admin
    conectar o canal antes de esgotar as tentativas). */
async function processEvent(event: ClaimedEvent): Promise<void> {
  const pharmacyId = await resolvePharmacyId(event);
  if (!pharmacyId) throw new Error("tenant não resolvido (canal sem conexão)");

  if (event.provider === "DIGISAC") {
    // message.* → mensagens; demais eventos retornam [] (aceitos sem ação).
    for (const m of extractMessagesDigisac(event.payload)) {
      await ingestMessage(pharmacyId, m);
    }
    return;
  }

  const eventName = normalizeEventName(event.payload?.event);
  if (eventName === "messages.upsert") {
    for (const m of extractMessages(event.payload)) {
      await ingestMessage(pharmacyId, m);
    }
  } else if (eventName === "connection.update") {
    await handleConnectionUpdate(pharmacyId, event.payload);
  }
  // outros eventos: aceitos sem ação na V1
}

/** Processa um evento reivindicado e fecha seu destino: PROCESSED, retry (PENDING +
    backoff) ou dead-letter (FAILED). */
async function handleClaimed(event: ClaimedEvent): Promise<void> {
  try {
    await processEvent(event);
    await prisma.webhookEvent.update({
      where: { id: event.id },
      data: { status: "PROCESSED", processedAt: new Date() },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const attempts = event.attempts + 1;
    const dead = isPermanent(err) || attempts >= MAX_ATTEMPTS;

    if (dead) {
      await prisma.webhookEvent.update({
        where: { id: event.id },
        data: { status: "FAILED", attempts, error: message.slice(0, 1000), processedAt: new Date() },
      });
      console.error(`[worker] evento ${event.id} → dead-letter (attempts=${attempts}): ${message.slice(0, 200)}`);
    } else {
      const delay = Math.min(BACKOFF_BASE_MS * 2 ** (attempts - 1), BACKOFF_MAX_MS);
      await prisma.webhookEvent.update({
        where: { id: event.id },
        data: { status: "PENDING", attempts, nextRetryAt: new Date(Date.now() + delay), error: message.slice(0, 1000) },
      });
    }
  }
}

/** Fecha ciclos OPEN cuja janela de 24h já expirou (inatividade), sem depender de nova msg. */
async function sweepExpiredCycles(): Promise<void> {
  await prisma.conversationCycle.updateMany({
    where: { status: "OPEN", expiresAt: { lt: new Date() } },
    data: { status: "CLOSED" },
  });
}

async function tick(): Promise<void> {
  await sweepExpiredCycles();
  await reapStalled();

  const batch = await claimBatch();
  for (const event of batch) {
    if (!running) break; // shutdown: para entre eventos (os não processados voltam via reaper)
    await handleClaimed(event);
  }
}

async function main(): Promise<void> {
  console.log("[worker] ingestão iniciada (poll a cada " + POLL_INTERVAL_MS + "ms)");
  while (running) {
    try {
      await tick();
    } catch (err) {
      console.error("[worker] erro no tick:", err);
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  await prisma.$disconnect();
  console.log("[worker] encerrado");
}

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    console.log("[worker] sinal " + sig + " recebido, encerrando...");
    running = false;
  });
}

main().catch((e) => {
  console.error("[worker] fatal:", e);
  process.exit(1);
});
