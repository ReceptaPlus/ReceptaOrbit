import "server-only";
import { getEvolutionConfig, getWebhookSetup } from "./config";

/* Cliente REST da Evolution API (pareamento WhatsApp). Usado pelas server actions da
   tela de configuração. Mantém o apikey fora do client bundle.
   Multi-tenant: toda função recebe o `instance` (1 instância por farmácia). */

type WhatsAppState = "DISCONNECTED" | "PAIRING" | "CONNECTED" | "DOWN";

async function call(path: string, init?: RequestInit): Promise<Response> {
  const { baseUrl, apiKey } = getEvolutionConfig();
  return fetch(baseUrl + path, {
    ...init,
    headers: { apikey: apiKey, "Content-Type": "application/json", ...(init?.headers ?? {}) },
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
}

/** Mapeia o estado da Evolution (open/connecting/close) p/ o nosso enum. */
export function mapState(raw: unknown): WhatsAppState {
  const s = String(raw ?? "").toLowerCase();
  if (s === "open") return "CONNECTED";
  if (s === "connecting") return "PAIRING";
  return "DISCONNECTED";
}

/** Estado vivo da instância na Evolution. Null se indeterminado. */
export async function getConnectionState(instance: string): Promise<WhatsAppState | null> {
  try {
    const r = await call(`/instance/connectionState/${instance}`);
    if (!r.ok) return null;
    const j = await r.json();
    return mapState(j?.instance?.state ?? j?.state);
  } catch {
    return null;
  }
}

/** Registra o nosso webhook na instância (idempotente; best-effort). Sem URL pública
    configurada, pula — o pareamento segue, mas não chegam eventos automaticamente. */
async function setWebhook(instance: string): Promise<void> {
  const setup = getWebhookSetup();
  if (!setup) return;
  try {
    await call(`/webhook/set/${instance}`, {
      method: "POST",
      body: JSON.stringify({
        webhook: { enabled: true, url: setup.url, webhookByEvents: false, byEvents: false, events: setup.events },
      }),
    });
  } catch {
    // best-effort: não bloqueia o pareamento se a configuração do webhook falhar.
  }
}

/** Garante que a instância existe (cria se 404) e (re)afirma o webhook. */
async function ensureInstance(instance: string): Promise<void> {
  const state = await call(`/instance/connectionState/${instance}`);
  if (state.status === 404) {
    await call(`/instance/create`, {
      method: "POST",
      body: JSON.stringify({ instanceName: instance, integration: "WHATSAPP-BAILEYS", qrcode: true }),
    });
  }
  await setWebhook(instance);
}

export interface PairingResult {
  qr: string | null; // data URI (base64) do QR
  pairingCode: string | null;
}

/** Inicia o pareamento da instância do tenant e devolve o QR/código. */
export async function connectInstance(instance: string): Promise<PairingResult> {
  await ensureInstance(instance);
  const r = await call(`/instance/connect/${instance}`);
  if (!r.ok) throw new Error(`Evolution connect falhou (HTTP ${r.status})`);
  const j = await r.json();
  const base64: string | undefined = j?.base64;
  const qr = base64 ? (base64.startsWith("data:") ? base64 : `data:image/png;base64,${base64}`) : null;
  return { qr, pairingCode: j?.pairingCode ?? j?.code ?? null };
}

/** Desconecta (logout) a instância do tenant. */
export async function logoutInstance(instance: string): Promise<void> {
  await call(`/instance/logout/${instance}`, { method: "DELETE" });
}
