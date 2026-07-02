/* Sign-off do parser contra payloads REAIS (prod). Lê os webhook_events brutos do
   DB, roda o mesmo parser do worker (extractMessages + parseJid) e mostra o que SERIA
   ingerido — sem escrever nada. Use quando o primeiro MESSAGES_UPSERT real chegar:
     npm run validate:webhook            (últimos 20 eventos messages.upsert)
     npm run validate:webhook -- 100     (últimos 100)
   Se algum texto sair "[mensagem não suportada]" ou telefone vazio, ajuste o parser. */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { extractMessages, normalizeEventName } from "../src/domain/ingestion/evolution-payload.js";
import { parseJid } from "../src/domain/ingestion/phone.js";

const db = new PrismaClient();
const limit = Number(process.argv[2] ?? 20) || 20;

try {
  const events = await db.webhookEvent.findMany({
    orderBy: { receivedAt: "desc" },
    take: limit,
  });
  if (events.length === 0) {
    console.log("Nenhum webhook_event no banco ainda. Pareie uma instância e envie uma mensagem real.");
    process.exit(0);
  }

  let upserts = 0;
  let extracted = 0;
  let unsupported = 0;
  let badPhone = 0;

  for (const ev of events) {
    const name = normalizeEventName(ev.eventType ?? (ev.payload as any)?.event);
    if (name !== "messages.upsert") continue;
    upserts++;
    const msgs = extractMessages(ev.payload);
    console.log(`\n— event ${ev.id.slice(0, 8)} (${ev.status}, instance=${ev.instanceName ?? "?"}) → ${msgs.length} msg(s)`);
    for (const m of msgs) {
      extracted++;
      const parsed = parseJid(m.remoteJid);
      const phone = parsed?.isGroup ? "(grupo→skip)" : parsed?.phoneE164 ?? "(JID inválido)";
      if (!parsed || (!parsed.isGroup && !parsed.phoneE164)) badPhone++;
      if (m.text === "[mensagem não suportada]") unsupported++;
      const dir = m.fromMe ? "OUT" : "IN ";
      console.log(`   [${dir}] ${phone} @ ${m.sentAt.toISOString()} :: ${JSON.stringify(m.text).slice(0, 80)}`);
    }
  }

  console.log("\n=== RESUMO ===");
  console.log(`eventos lidos: ${events.length} | messages.upsert: ${upserts} | msgs extraídas: ${extracted}`);
  console.log(`⚠️ não-suportadas: ${unsupported} | ⚠️ telefone inválido: ${badPhone}`);
  if (unsupported === 0 && badPhone === 0 && extracted > 0) {
    console.log("✅ Parser OK contra os payloads reais presentes.");
  } else if (extracted === 0) {
    console.log("ℹ️ Nenhuma mensagem extraída — confira se há eventos messages.upsert reais.");
  } else {
    console.log("❌ Há casos não cobertos — ajuste evolution-payload.ts e rode test:parser.");
  }
} catch (e) {
  console.error("validate:webhook ERRO:", e instanceof Error ? e.message : e);
  process.exit(1);
} finally {
  await db.$disconnect();
}
