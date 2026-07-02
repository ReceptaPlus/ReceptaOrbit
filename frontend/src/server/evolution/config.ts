import "server-only";

/* Config da Evolution API (lida do ambiente).
   Multi-tenant: a INSTÂNCIA é por farmácia (derivada do slug, guardada em
   WhatsAppConnection.instanceName) — NÃO é mais um env global. Aqui ficam só os
   dados do servidor Evolution (base/key), o prefixo de nomes e o webhook. */

export interface EvolutionConfig {
  baseUrl: string;
  apiKey: string;
}

/** Config base p/ chamar a Evolution. Lança se faltar (use só em código que chama). */
export function getEvolutionConfig(): EvolutionConfig {
  const baseUrl = process.env.EVOLUTION_BASE_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error("Evolution não configurada: defina EVOLUTION_BASE_URL e EVOLUTION_API_KEY.");
  }
  return { baseUrl: baseUrl.replace(/\/$/, ""), apiKey };
}

/** Prefixo do nome da instância. Namespaceia ambientes que compartilham um mesmo
    servidor Evolution (dev/staging/prod) p/ os nomes não colidirem. Default "orbit". */
export function getInstancePrefix(): string {
  const raw = (process.env.EVOLUTION_INSTANCE_PREFIX ?? "orbit").replace(/[^a-z0-9-]/gi, "").toLowerCase();
  return raw || "orbit";
}

/** Segredo do webhook (opcional em dev; obrigatório em prod — ver route.ts). */
export function getWebhookSecret(): string | null {
  return process.env.EVOLUTION_WEBHOOK_SECRET ?? null;
}

<<<<<<< HEAD
/** URL pública do endpoint de ingestão que a Evolution deve chamar (POST). Já com
   ?secret= anexado quando EVOLUTION_WEBHOOK_SECRET está setado. Null = não configurada
   (o pareamento segue, mas nenhuma mensagem chega — logamos o aviso). */
export function getWebhookUrl(): string | null {
  const raw = process.env.EVOLUTION_WEBHOOK_URL;
  if (!raw) return null;
  const base = raw.replace(/\/$/, "");
  const secret = getWebhookSecret();
  if (!secret) return base;
  return base + (base.includes("?") ? "&" : "?") + "secret=" + encodeURIComponent(secret);
=======
export interface WebhookSetup {
  url: string;
  events: string[];
}

/** URL pública do NOSSO endpoint de webhook, registrada em cada instância Evolution
    no pareamento. Null se não configurada (pareia, mas sem ingestão automática).
    EVOLUTION_WEBHOOK_URL = ex.: https://app.recepta.com.br/api/webhooks/evolution */
export function getWebhookSetup(): WebhookSetup | null {
  const base = process.env.EVOLUTION_WEBHOOK_URL;
  if (!base) return null;
  const secret = getWebhookSecret();
  const url = secret ? `${base}${base.includes("?") ? "&" : "?"}secret=${encodeURIComponent(secret)}` : base;
  return { url, events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE"] };
>>>>>>> 381c05421ddd0836070f8d5572bb400460d33cb3
}
