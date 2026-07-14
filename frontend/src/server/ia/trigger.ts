import "server-only";
import { hitRateLimit } from "@/lib/rate-limit";

/* Dispara a análise de IA (n8n) sob demanda — chamado no login, escopado por farmácia.
   Substitui o cron cross-tenant: uma farmácia só é analisada quando alguém dela entra,
   então farmácias inativas não geram custo de Claude. O app continua NÃO rodando LLM —
   só chuta o webhook do n8n, que faz GET pendentes → Claude → POST resultado.

   Robustez: fire-and-forget com timeout curto. Falha aqui (n8n fora, timeout, rede)
   NUNCA quebra o login — a análise apenas espera o próximo login. Throttle em memória
   evita que uma rajada de logins da mesma farmácia vire N execuções do n8n. */

const THROTTLE_MS = 30 * 60 * 1000; // no máx. 1 disparo por farmácia a cada 30 min
const TIMEOUT_MS = 2000; // teto de latência somada ao login em caso de n8n lento/fora

/* IA_TRIGGER_WEBHOOK_URL: 1+ URLs de webhook do n8n separadas por vírgula (análise de
   ciclos e relatório do dono). Todas recebem o mesmo POST { pharmacyId }, em paralelo. */
export async function triggerPharmacyAnalysis(pharmacyId: string): Promise<void> {
  const urls = (process.env.IA_TRIGGER_WEBHOOK_URL ?? "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
  if (urls.length === 0) return; // sem webhook configurado (dev/local): no-op silencioso

  // Throttle por farmácia: 10 logins seguidos não viram 10 execuções do n8n.
  if (!hitRateLimit(`ia-trigger:${pharmacyId}`, 1, THROTTLE_MS).ok) return;

  const secret = process.env.IA_INGEST_SECRET?.trim();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    await Promise.allSettled(
      urls.map((url) =>
        fetch(url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(secret ? { "x-ia-secret": secret } : {}),
          },
          body: JSON.stringify({ pharmacyId }),
          signal: ctrl.signal,
          cache: "no-store",
        }),
      ),
    );
  } catch {
    // n8n fora / timeout / rede: ignora de propósito — roda no próximo login.
  } finally {
    clearTimeout(timer);
  }
}
