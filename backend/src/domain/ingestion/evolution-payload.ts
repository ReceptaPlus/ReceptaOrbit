/* Extração defensiva do payload do webhook Evolution (Baileys).
   ⚠️ Shape baseado na doc/observação da Evolution v2; será AJUSTADO quando
   capturarmos um MESSAGES_UPSERT real (o WebhookEvent guarda o bruto p/ replay).
   Tudo opcional + defensivo: payload de WhatsApp é heterogêneo (texto, mídia, etc.). */

export interface NormalizedMessage {
  providerMessageId: string | null;
  remoteJid: string | undefined;
  fromMe: boolean;
  pushName: string | null;
  text: string;
  sentAt: Date;
}

/** Nome do evento normalizado (Evolution manda "messages.upsert" ou "MESSAGES_UPSERT"). */
export function normalizeEventName(event: unknown): string {
  return String(event ?? "").toLowerCase().replace(/_/g, ".");
}

/** Texto de uma mensagem Baileys, cobrindo os tipos mais comuns. Mídia → rótulo. */
function extractText(message: any): string {
  if (!message || typeof message !== "object") return "";
  if (typeof message.conversation === "string") return message.conversation;
  if (message.extendedTextMessage?.text) return String(message.extendedTextMessage.text);
  if (message.imageMessage) return message.imageMessage.caption ? `[imagem] ${message.imageMessage.caption}` : "[imagem]";
  if (message.videoMessage) return message.videoMessage.caption ? `[vídeo] ${message.videoMessage.caption}` : "[vídeo]";
  if (message.audioMessage) return "[áudio]";
  if (message.documentMessage) return `[documento] ${message.documentMessage.fileName ?? ""}`.trim();
  if (message.stickerMessage) return "[figurinha]";
  if (message.locationMessage) return "[localização]";
  if (message.contactMessage) return "[contato]";
  if (message.buttonsResponseMessage?.selectedDisplayText) return String(message.buttonsResponseMessage.selectedDisplayText);
  if (message.listResponseMessage?.title) return String(message.listResponseMessage.title);
  return "[mensagem não suportada]";
}

/** Converte o timestamp do Baileys (segundos, number|string|Long) em Date. */
function toDate(ts: unknown): Date {
  if (ts == null) return new Date();
  if (typeof ts === "number") return new Date(ts * 1000);
  if (typeof ts === "string" && /^\d+$/.test(ts)) return new Date(Number(ts) * 1000);
  // Long do Baileys: { low, high } — usa low (suficiente até 2038).
  if (typeof ts === "object" && ts !== null && "low" in (ts as any)) {
    return new Date(Number((ts as any).low) * 1000);
  }
  const d = new Date(ts as any);
  return isNaN(d.getTime()) ? new Date() : d;
}

/** Um MESSAGES_UPSERT pode trazer `data` como objeto único ou array. Normaliza p/ lista. */
export function extractMessages(payload: any): NormalizedMessage[] {
  const data = payload?.data;
  if (!data) return [];
  const items = Array.isArray(data) ? data : [data];

  return items
    .filter((it) => it && it.key)
    .map((it): NormalizedMessage => ({
      providerMessageId: it.key?.id ?? null,
      remoteJid: it.key?.remoteJid,
      fromMe: Boolean(it.key?.fromMe),
      pushName: it.pushName ?? null,
      text: extractText(it.message),
      sentAt: toDate(it.messageTimestamp),
    }));
}
