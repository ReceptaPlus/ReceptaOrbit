"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/* Aviso NÃO-bloqueante de análise em andamento (/vendas). A análise roda no n8n em segundo
   plano; a página já mostra o que existe. Enquanto houver ciclos pendentes, faz router.refresh()
   a cada 15s → o server component re-busca vendas/relatório/contagem e os novos resultados
   aparecem sozinhos, sem F5. Para quando pendingCount chega a 0 (some) ou após o teto de
   tentativas ociosas (evita polling infinito se algum ciclo nunca fechar a análise — ex.: parse
   que sempre falha). Progresso (contagem caindo) renova o orçamento de tentativas. */

const POLL_MS = 15_000;
const MAX_IDLE_POLLS = 40; // ~10 min sem progresso → para de refrescar

export function AnalysisStatus({ pendingCount }: { pendingCount: number }) {
  const router = useRouter();
  const polls = useRef(0);
  const lastCount = useRef(pendingCount);

  useEffect(() => {
    if (pendingCount < lastCount.current) polls.current = 0; // progresso → renova orçamento
    lastCount.current = pendingCount;

    if (pendingCount <= 0 || polls.current >= MAX_IDLE_POLLS) return;

    const id = setInterval(() => {
      polls.current += 1;
      router.refresh();
      if (polls.current >= MAX_IDLE_POLLS) clearInterval(id);
    }, POLL_MS);
    return () => clearInterval(id);
  }, [pendingCount, router]);

  if (pendingCount <= 0) return null;

  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-info-text/20 bg-info-bg px-4 py-3 text-small text-info-text animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <span
        className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-info-text/30 border-t-info-text"
        aria-hidden
      />
      <span>
        {pendingCount} {pendingCount === 1 ? "conversa" : "conversas"} na fila de análise da IA — os
        resultados aparecem aqui automaticamente.
      </span>
    </div>
  );
}
