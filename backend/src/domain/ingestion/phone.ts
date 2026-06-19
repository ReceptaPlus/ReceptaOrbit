/* Normalização de telefone para E.164 (chave de consolidação do Contact por tenant).
   Evolution entrega o JID no formato "5511999998888@s.whatsapp.net" (sem '+').
   Política V1: extrair só dígitos e prefixar '+'. Refinos (9º dígito BR) ficam para
   quando tivermos volume real de payloads para validar. */

export interface ParsedJid {
  phoneE164: string;
  isGroup: boolean;
}

/** Extrai o número do JID do WhatsApp. Retorna null se não for um contato individual. */
export function parseJid(jid: string | undefined | null): ParsedJid | null {
  if (!jid) return null;
  const at = jid.indexOf("@");
  const domain = at >= 0 ? jid.slice(at + 1) : "";
  const raw = at >= 0 ? jid.slice(0, at) : jid;

  // Grupos (@g.us) e broadcast não viram Contact na V1.
  const isGroup = domain.includes("g.us") || domain.includes("broadcast");
  if (isGroup) return { phoneE164: "", isGroup: true };

  // JID pode vir como "5511...:12@s.whatsapp.net" (device suffix) — corta no ':'.
  const digits = raw.split(":")[0].replace(/\D/g, "");
  if (!digits) return null;

  return { phoneE164: "+" + digits, isGroup: false };
}
