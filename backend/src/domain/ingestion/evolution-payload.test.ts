import { test } from "node:test";
import assert from "node:assert/strict";
import {
  extractMessages,
  normalizeEventName,
  unwrapMessage,
  isNonContentMessage,
} from "./evolution-payload.js";

/* Replay-test do parser contra shapes DOCUMENTADOS da Evolution v2 (Baileys).
   Não substitui um payload REAL em prod (ver validate:webhook), mas trava as
   variações conhecidas: wrappers, tipos de mídia, batch, ruído de protocolo. */

const JID = "5511999990000@s.whatsapp.net";

function upsert(data: unknown, instance = "orbit01") {
  return { event: "messages.upsert", instance, data };
}
function item(message: unknown, over: Record<string, unknown> = {}) {
  return {
    key: { remoteJid: JID, fromMe: false, id: "ABC123" },
    pushName: "Maria",
    messageTimestamp: 1_700_000_000,
    message,
    ...over,
  };
}

test("normalizeEventName cobre MESSAGES_UPSERT e messages.upsert", () => {
  assert.equal(normalizeEventName("MESSAGES_UPSERT"), "messages.upsert");
  assert.equal(normalizeEventName("messages.upsert"), "messages.upsert");
  assert.equal(normalizeEventName(undefined), "");
});

test("texto simples (conversation) → INBOUND", () => {
  const out = extractMessages(upsert(item({ conversation: "Oi, tem dipirona?" })));
  assert.equal(out.length, 1);
  assert.equal(out[0].text, "Oi, tem dipirona?");
  assert.equal(out[0].fromMe, false);
  assert.equal(out[0].providerMessageId, "ABC123");
  assert.equal(out[0].pushName, "Maria");
});

test("extendedTextMessage (resposta)", () => {
  const out = extractMessages(upsert(item({ extendedTextMessage: { text: "Sim, temos" } })));
  assert.equal(out[0].text, "Sim, temos");
});

test("imagem com legenda → rótulo + legenda", () => {
  const out = extractMessages(upsert(item({ imageMessage: { caption: "segue foto" } })));
  assert.equal(out[0].text, "[imagem] segue foto");
});

test("áudio → rótulo", () => {
  const out = extractMessages(upsert(item({ audioMessage: { seconds: 5 } })));
  assert.equal(out[0].text, "[áudio]");
});

test("ephemeralMessage (mensagem temporária) é desembrulhada", () => {
  const out = extractMessages(upsert(item({ ephemeralMessage: { message: { conversation: "some em 24h" } } })));
  assert.equal(out.length, 1);
  assert.equal(out[0].text, "some em 24h");
});

test("viewOnceMessageV2 (ver-uma-vez) desembrulha p/ mídia", () => {
  const out = extractMessages(upsert(item({ viewOnceMessageV2: { message: { imageMessage: { caption: "" } } } })));
  assert.equal(out[0].text, "[imagem]");
});

test("fromMe = true → OUTBOUND (direção derivada no ingest)", () => {
  const out = extractMessages(upsert(item({ conversation: "ok" }, { key: { remoteJid: JID, fromMe: true, id: "OUT1" } })));
  assert.equal(out[0].fromMe, true);
});

test("timestamp string e Long {low,high} viram Date válida", () => {
  const asString = extractMessages(upsert(item({ conversation: "a" }, { messageTimestamp: "1700000000" })));
  assert.ok(asString[0].sentAt instanceof Date && !isNaN(asString[0].sentAt.getTime()));
  assert.equal(asString[0].sentAt.getTime(), 1_700_000_000_000);
  const asLong = extractMessages(upsert(item({ conversation: "b" }, { messageTimestamp: { low: 1_700_000_000, high: 0 } })));
  assert.equal(asLong[0].sentAt.getTime(), 1_700_000_000_000);
});

test("batch: data como array de 2 mensagens", () => {
  const out = extractMessages(upsert([item({ conversation: "um" }), item({ conversation: "dois" }, { key: { remoteJid: JID, fromMe: false, id: "X2" } })]));
  assert.equal(out.length, 2);
  assert.deepEqual(out.map((m) => m.text), ["um", "dois"]);
});

test("forma alternativa: data.messages = [...]", () => {
  const out = extractMessages(upsert({ messages: [item({ conversation: "via messages" })] }));
  assert.equal(out.length, 1);
  assert.equal(out[0].text, "via messages");
});

test("protocolMessage (revoke/delete) é descartado", () => {
  const out = extractMessages(upsert(item({ protocolMessage: { type: "REVOKE" } })));
  assert.equal(out.length, 0);
});

test("reactionMessage (👍) é descartado", () => {
  const out = extractMessages(upsert(item({ reactionMessage: { text: "👍" } })));
  assert.equal(out.length, 0);
});

test("item sem key é ignorado", () => {
  const out = extractMessages(upsert([{ message: { conversation: "sem key" } }, item({ conversation: "com key" })]));
  assert.equal(out.length, 1);
  assert.equal(out[0].text, "com key");
});

test("payload sem data → lista vazia (não quebra)", () => {
  assert.deepEqual(extractMessages({ event: "messages.upsert", instance: "x" }), []);
  assert.deepEqual(extractMessages(null), []);
});

test("unwrapMessage e isNonContentMessage isolados", () => {
  assert.deepEqual(unwrapMessage({ ephemeralMessage: { message: { conversation: "x" } } }), { conversation: "x" });
  assert.equal(isNonContentMessage({ protocolMessage: {} }), true);
  assert.equal(isNonContentMessage({ conversation: "oi" }), false);
  assert.equal(isNonContentMessage({ messageContextInfo: {} }), true);
});
