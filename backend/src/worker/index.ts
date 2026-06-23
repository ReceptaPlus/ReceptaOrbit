import "dotenv/config";
import { prisma } from "../db/client.js";
import { ingestMessage } from "../domain/ingestion/ingest.js";
import { extractMessages, normalizeEventName } from "../domain/ingestion/evolution-payload.js";

/* Worker de ingestão (V1). Faz POLL da tabela webhook_events (status PENDING) —
   ela É a fila durável/replayável (sem pg-boss na V1; entra quando o volume pedir).
   Responsabilidades:
   - messages.upsert → ingestMessage (Contact/Message/Ciclo)
   - connection.update → sincroniza WhatsAppConnection.state
   - sweep: fecha ciclos OPEN expirados (inatividade de 24h) mesmo sem nova msg
   Processo separado, roda na Railway. Só precisa de DATABASE_URL. */

const POLL_INTERVAL_MS = 3000;
const BATCH_SIZE = 25;

let running = true;

/** Resolve o tenant pelo nome da instância Evolution (quando o webhook não resolveu). */
async function resolvePharmacyId(event: { pharmacyId: string | null; instanceName: string | null; payload: unknown }): Promise<string | null> {
  if (event.pharmacyId) return event.pharmacyId;
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

async function processEvent(event: {
  id: string;
  pharmacyId: string | null;
  instanceName: string | null;
  payload: any;
}): Promise<void> {
  const eventName = normalizeEventName(event.payload?.event);
  const pharmacyId = await resolvePharmacyId(event);

  if (!pharmacyId) {
    await prisma.webhookEvent.update({
      where: { id: event.id },
      data: { status: "FAILED", error: "tenant não resolvido (instância sem WhatsAppConnection)", processedAt: new Date() },
    });
    return;
  }

  if (eventName === "messages.upsert") {
    const messages = extractMessages(event.payload);
    for (const m of messages) {
      await ingestMessage(pharmacyId, m);
    }
  } else if (eventName === "connection.update") {
    await handleConnectionUpdate(pharmacyId, event.payload);
  }
  // outros eventos: aceitos e marcados como processados (sem ação na V1)

  await prisma.webhookEvent.update({
    where: { id: event.id },
    data: { status: "PROCESSED", processedAt: new Date() },
  });
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

  const batch = await prisma.webhookEvent.findMany({
    where: { status: "PENDING" },
    orderBy: { receivedAt: "asc" },
    take: BATCH_SIZE,
  });

  for (const event of batch) {
    try {
      await processEvent(event as any);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await prisma.webhookEvent.update({
        where: { id: event.id },
        data: { status: "FAILED", error: message.slice(0, 1000), processedAt: new Date() },
      });
    }
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
