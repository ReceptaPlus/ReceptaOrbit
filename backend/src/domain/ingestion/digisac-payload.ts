import type { NormalizedMessage } from "./evolution-payload.js";

/* Normaliza o webhook da Digisac → NormalizedMessage (mesmo contrato que o
   ingestMessage consome, agnóstico de provider).

   Fase 1 (WhatsApp via Digisac): sintetiza um remoteJid a partir do telefone do
   contato, então parseJid/ingestMessage NÃO mudam. Eventos sem texto (mídia) ou
   sem telefone (canais sem número, ex.: Instagram) são ignorados nesta fase —
   entram quando o multicanal real (channel + channelContactId) for implementado.

   🔎 O shape do payload Digisac varia por versão/conta. Assumimos:
   { event, data: { id, isFromMe, text, type, timestamp, contact: { name, data: { number } } } }
   Confirmar na documentação oficial antes do go-live. */

function digisacDate(ts: unknown): Date {
  if (typeof ts === "number") return new Date(ts < 1e12 ? ts * 1000 : ts); // epoch s ou ms
  if (typeof ts === "string") {
    if (/^\d+$/.test(ts)) {
      const n = Number(ts);
      return new Date(n < 1e12 ? n * 1000 : n);
    }
    const d = new Date(ts); // ISO 8601
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

function onlyDigits(v: unknown): string {
  return typeof v === "string" ? v.replace(/\D/g, "") : "";
}

/** True se o evento Digisac carrega uma mensagem de chat (não status/ticket/contato). */
export function isDigisacMessageEvent(event: unknown): boolean {
  const e = String(event ?? "").toLowerCase();
  return e === "message" || e.startsWith("message.");
}

export function extractMessagesDigisac(payload: any): NormalizedMessage[] {
  if (!isDigisacMessageEvent(payload?.event)) return [];
  const d = payload?.data;
  if (!d) return [];

  const text =
    typeof d.text === "string" ? d.text : typeof d.message === "string" ? d.message : "";
  if (!text.trim()) return []; // mídia/sem conteúdo: fora da fase 1

  // Telefone do contato (WhatsApp). Canais sem número ficam para o multicanal (fase 2).
  const number = onlyDigits(d.contact?.data?.number ?? d.contact?.number ?? d.number);
  if (!number) return [];

  return [
    {
      providerMessageId: typeof d.id === "string" ? d.id : null,
      remoteJid: `${number}@s.whatsapp.net`, // sintetiza JID → parseJid extrai E.164
      fromMe: Boolean(d.isFromMe ?? d.fromMe),
      pushName: typeof d.contact?.name === "string" ? d.contact.name : null,
      text,
      sentAt: digisacDate(d.timestamp ?? d.createdAt ?? d.date),
    },
  ];
}
