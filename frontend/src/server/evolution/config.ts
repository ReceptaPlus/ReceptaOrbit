import "server-only";

/* Config da Evolution API (lida do ambiente). base/key/instance alimentam o cliente
   de pareamento (Bloco C); webhookSecret protege o endpoint de ingestão.
   Ausentes em dev até o pareamento; o getter avisa em vez de quebrar no import. */

export interface EvolutionConfig {
  baseUrl: string;
  apiKey: string;
  instance: string;
}

/** Config p/ chamar a Evolution. Lança se faltar (use só em código que precisa chamar). */
export function getEvolutionConfig(): EvolutionConfig {
  const baseUrl = process.env.EVOLUTION_BASE_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;
  if (!baseUrl || !apiKey || !instance) {
    throw new Error("Evolution não configurada: defina EVOLUTION_BASE_URL, EVOLUTION_API_KEY e EVOLUTION_INSTANCE.");
  }
  return { baseUrl: baseUrl.replace(/\/$/, ""), apiKey, instance };
}

/** Segredo do webhook (opcional). Null = sem checagem (dev). */
export function getWebhookSecret(): string | null {
  return process.env.EVOLUTION_WEBHOOK_SECRET ?? null;
}
