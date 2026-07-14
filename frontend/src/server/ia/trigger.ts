import "server-only";
import { db } from "@/server/db";

/* Dispara a análise de IA (n8n) sob demanda — chamado na ENTRADA do app (dashboard layout),
   escopado por farmácia. Substitui o cron cross-tenant: uma farmácia só é analisada quando
   alguém dela usa o app, então farmácias inativas não geram custo de Claude. O app continua
   NÃO rodando LLM — só chuta o webhook do n8n, que faz GET pendentes → Claude → POST resultado.

   Trava de cooldown DURÁVEL (não mais throttle em memória): um UPDATE condicional atômico
   reivindica a janela de 24h. O Postgres garante um único vencedor por janela POR FARMÁCIA —
   entre réplicas e sobrevivendo a deploy/restart. Então N logins/aberturas do app (mesmo em
   instâncias diferentes) resultam em NO MÁXIMO 1 disparo a cada 24h. É o que torna
   "múltiplos logins → 1 análise" uma garantia, não um best-effort.

   Fire-and-forget: falha aqui (n8n fora, timeout) NUNCA quebra a navegação. O app roda em
   servidor persistente (Railway), então o fetch não-aguardado completa. Reivindica-ANTES-de-
   disparar (at-most-once): se o n8n estiver fora, a janela é consumida e a análise espera a
   próxima — troca deliberada a favor de custo (nunca dispara demais). */

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 1 disparo por farmácia a cada 24h

export async function triggerPharmacyAnalysis(pharmacyId: string): Promise<void> {
  const urls = (process.env.IA_TRIGGER_WEBHOOK_URL ?? "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
  if (urls.length === 0) return; // sem webhook configurado (dev/local): no-op silencioso

  // Reivindica a janela de forma ATÔMICA: só quem consegue mover last_ai_run_at dispara.
  // updateMany com WHERE condicional é uma única UPDATE no Postgres → sem corrida, sem
  // depender de memória do processo. count === 0 = outra requisição/réplica já disparou.
  const now = new Date();
  const cutoff = new Date(now.getTime() - COOLDOWN_MS);
  let claimed = 0;
  try {
    const res = await db.pharmacy.updateMany({
      where: {
        id: pharmacyId,
        OR: [{ lastAiRunAt: null }, { lastAiRunAt: { lt: cutoff } }],
      },
      data: { lastAiRunAt: now },
    });
    claimed = res.count;
  } catch {
    return; // erro de DB não deve quebrar a navegação; tenta de novo na próxima entrada.
  }
  if (claimed === 0) return; // já disparado dentro da janela de 24h

  const secret = process.env.IA_INGEST_SECRET?.trim();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2000);
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
    // n8n fora / timeout / rede: ignora de propósito — roda na próxima janela.
  } finally {
    clearTimeout(timer);
  }
}
