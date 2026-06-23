/* Extração defensiva do payload do webhook Evolution (Baileys).
   Coberto por replay-test contra shapes documentados da Evolution v2
   (evolution-payload.test.ts). ⚠️ Sign-off final ainda exige UM payload REAL
   capturado em prod — rode `npm run validate:webhook` sobre os webhook_events
   brutos quando o primeiro MESSAGES_UPSERT real chegar.
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

/** Baileys aninha a mensagem real dentro de wrappers (ephemeral, viewOnce, editada,
    documento-com-legenda). Desembrulha até chegar no conteúdo. */
export function unwrapMessage(message: any): any {
  let m = message;
  for (let i = 0; i < 4 && m && typeof m === "object"; i++) {
    const inner =
      m.ephemeralMessage?.message ??
      m.viewOnceMessage?.message ??
      m.viewOnceMessageV2?.message ??
      m.viewOnceMessageV2Extension?.message ??
      m.documentWithCaptionMessage?.message ??
      m.editedMessage?.message;
    if (!inner) break;
    m = inner;
  }
  return m;
}

/** Mensagens sem conteúdo de conversa (protocolo/reação/chave) — não viram Message.
    protocolMessage = revoke/delete/history-sync; reactionMessage = 👍 noutra msg. */
export function isNonContentMessage(message: any): boolean {
  if (!message || typeof message !== "object") return true;
  if (message.protocolMessage || message.reactionMessage || message.senderKeyDistributionMessage) return true;
  // messageContextInfo sozinho (sem conteúdo real) também é ruído.
  if (message.messageContextInfo && Object.keys(message).length === 1) return true;
  return false;
}

/** Texto de uma mensagem Baileys (já desembrulhada), cobrindo os tipos mais comuns. Mídia → rótulo. */
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

/** Um MESSAGES_UPSERT pode trazer `data` como objeto único, array, ou `{ messages: [...] }`.
    Normaliza p/ lista, desembrulha wrappers e descarta ruído sem conteúdo. */
export function extractMessages(payload: any): NormalizedMessage[] {
  const data = payload?.data;
  if (!data) return [];
  const rawItems = Array.isArray(data)
    ? data
    : Array.isArray(data.messages)
      ? data.messages
      : [data];

  return rawItems
    .filter((it: any) => it && it.key)
    .map((it: any) => ({ it, message: unwrapMessage(it.message) }))
    .filter(({ message }: { message: any }) => !isNonContentMessage(message))
    .map(({ it, message }: { it: any; message: any }): NormalizedMessage => ({
      providerMessageId: it.key?.id ?? null,
      remoteJid: it.key?.remoteJid,
      fromMe: Boolean(it.key?.fromMe),
      pushName: it.pushName ?? null,
      text: extractText(message),
      sentAt: toDate(it.messageTimestamp),
    }));
}
