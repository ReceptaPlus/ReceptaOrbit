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
}
