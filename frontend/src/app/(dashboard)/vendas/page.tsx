import Link from "next/link";
import { listSalesVM, getLatestSalesReportVM, countPendingCycles } from "@/server/ia/queries";
import { AnalysisStatus } from "./analysis-status";

/* Vendas — alimentado pela IA (análise das conversas roda no n8n; o app só exibe).
   Mostra o relatório do período (narrativa pro dono + métricas vendas×conversas) e a
   lista de vendas identificadas. Sem análise ainda → estado "aguardando IA". */

export default async function VendasPage() {
  const [sales, report, pendingCount] = await Promise.all([
    listSalesVM(),
    getLatestSalesReportVM(),
    countPendingCycles(),
  ]);

  return (
    <div className="space-y-6">
      <header className="animate-fade-in">
        <h1 className="font-display text-display-lg font-bold tracking-tight text-ink">Vendas</h1>
        <p className="mt-1 text-body text-secondary">
          Vendas identificadas pela IA a partir das conversas do WhatsApp.
        </p>
      </header>

      {/* Aviso não-bloqueante + auto-refresh enquanto a IA está processando o backlog */}
      <AnalysisStatus pendingCount={pendingCount} />

      {/* Relatório do dono (narrativa + métricas do período) */}
      {report ? (
        <section className="card-premium animate-fade-in-up p-5">
          <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-subtitle font-semibold text-ink">Resumo do período</h2>
            <span className="text-caption text-muted">{report.periodDisplay}</span>
          </header>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metric label="Vendas" value={String(report.salesCount)} />
            <Metric label="Faturamento" value={report.salesValueDisplay} />
            <Metric label="Conversas" value={String(report.conversationCount)} />
            <Metric label="Conversão" value={report.conversionDisplay} />
          </div>
          <p className="mt-4 rounded-lg border border-line-subtle bg-cream-alt/30 p-4 text-small leading-relaxed text-ink">
            {report.narrative}
          </p>
          <p className="mt-2 text-micro text-muted">Gerado por IA em {report.generatedAtDisplay}.</p>
        </section>
      ) : (
        <section className="card-premium animate-fade-in-up flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
          <span className="inline-flex items-center rounded-full bg-info-bg px-3 py-1 text-caption font-semibold text-info-text">
            Aguardando IA
          </span>
          <p className="max-w-md text-body text-secondary">
            O relatório de vendas é gerado automaticamente pela IA a partir das suas conversas.
            Assim que a primeira análise rodar, ele aparece aqui.
          </p>
        </section>
      )}

      {/* Lista de vendas identificadas */}
      <section className="card-premium animate-fade-in-up p-0">
        <header className="flex items-center justify-between border-b border-line-subtle px-5 py-4">
          <h2 className="font-display text-subtitle font-semibold text-ink">Vendas identificadas</h2>
          <span className="text-caption text-muted">
            {sales.length} {sales.length === 1 ? "venda" : "vendas"}
          </span>
        </header>
        {sales.length === 0 ? (
          <p className="px-5 py-10 text-center text-small text-secondary">Nenhuma venda identificada ainda.</p>
        ) : (
          <ul className="divide-y divide-line-subtle">
            {sales.map((s) => (
              <li key={s.cycleId} className="px-5 py-4">
                <Link href={`/conversas/${s.cycleId}`} className="group flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink group-hover:text-brand-500">{s.contactName}</p>
                    <p className="mt-0.5 line-clamp-2 text-small text-secondary">{s.summary}</p>
                    <p className="mt-1 text-micro text-muted">{s.dateDisplay}</p>
                  </div>
                  {s.valueDisplay ? (
                    <span className="shrink-0 font-display text-subtitle font-bold text-success-text" data-numeric>
                      {s.valueDisplay}
                    </span>
                  ) : (
                    <span className="shrink-0 text-small text-muted">valor n/d</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line-subtle bg-white/50 p-3">
      <p className="text-caption text-muted">{label}</p>
      <p className="mt-1 font-display text-title font-bold text-ink" data-numeric>{value}</p>
    </div>
  );
}
