import Link from "next/link";
import { dashboard, formatBRL, formatDate, sales } from "@/lib/mock-data";
import { ConfidencePill, SaleStatusBadge, SourceBadge } from "@/components/badges";
import { KpiCard } from "@/components/kpi-card";

export default function VendasPage() {
  return (
    <div className="space-y-6">
      <header className="animate-fade-in flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-display-lg font-bold tracking-tight text-ink">Vendas</h1>
          <p className="mt-1 text-body text-secondary">
            Todas as vendas confirmadas, pendentes e canceladas — identificadas por IA, integração ou registro manual.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {["Período", "Origem", "Status", "Produto"].map((f) => (
            <button
              key={f}
              className="rounded-lg border border-line bg-white/70 px-3 py-1.5 text-small text-secondary backdrop-blur transition-colors hover:border-brand-400 hover:text-brand-500"
            >
              {f} ▾
            </button>
          ))}
          <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 px-3.5 py-2 text-small font-medium text-white shadow-[0_4px_16px_rgba(212,67,44,0.25)] transition-transform hover:scale-[1.02]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" /></svg>
            Exportar CSV
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-5">
        <KpiCard label="Total vendido" value={formatBRL(dashboard.totalSoldCents)} delta={{ value: "22%", direction: "up" }} hint="vs. 7d" accent index={0} />
        <KpiCard label="Ticket médio" value={formatBRL(dashboard.avgTicketCents)} delta={{ value: "4.1%", direction: "up" }} hint="por venda" index={1} />
        <KpiCard label="Conversões" value={String(dashboard.confirmedSalesCount)} delta={{ value: "8.4%", direction: "up" }} hint="confirmadas" index={2} />
        <KpiCard label="Maior comprador" value="Felipe A." hint="R$ 4.820 acumulado" index={3} />
        <KpiCard label="Mais vendido" value="Vitamina D" hint="186 un · 30d" index={4} />
      </div>

      <div className="card-premium animate-fade-in-up overflow-x-auto p-0">
        <table className="row-stagger w-full text-small">
          <thead>
            <tr className="border-b border-line text-left text-caption font-semibold uppercase tracking-wide text-muted">
              <th className="px-5 py-3.5">Cliente</th>
              <th className="px-5 py-3.5">Data</th>
              <th className="px-5 py-3.5">Origem</th>
              <th className="px-5 py-3.5">Campanha</th>
              <th className="px-5 py-3.5">Produtos</th>
              <th className="px-5 py-3.5 text-right">Valor</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Identificação</th>
              <th className="px-5 py-3.5">Confiança</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id} className="border-b border-line-subtle transition-colors last:border-0 hover:bg-cream-alt/40">
                <td className="px-5 py-3.5 font-medium text-ink">{s.contactName}</td>
                <td className="px-5 py-3.5 text-secondary">{formatDate(s.soldAt)}</td>
                <td className="px-5 py-3.5"><SourceBadge source={s.attributionSource} /></td>
                <td className="px-5 py-3.5 text-secondary">{s.campaignName ?? "—"}</td>
                <td className="px-5 py-3.5 text-secondary">
                  {s.items.map((i) => `${i.quantity}× ${i.productName}`).join(", ")}
                </td>
                <td className="px-5 py-3.5 text-right font-semibold text-ink" data-numeric>{formatBRL(s.netAmountCents)}</td>
                <td className="px-5 py-3.5"><SaleStatusBadge status={s.status} /></td>
                <td className="px-5 py-3.5 text-secondary">
                  {s.identificationSource === "AI" ? "IA" : s.identificationSource === "MANUAL" ? "Manual" : "Integração"}
                </td>
                <td className="px-5 py-3.5"><ConfidencePill value={s.confidence} /></td>
                <td className="px-5 py-3.5">
                  {s.status === "PENDING_REVIEW" && (
                    <button className="rounded-lg bg-brand-500 px-3 py-1.5 text-micro font-medium text-white transition-colors hover:bg-brand-600">
                      Confirmar
                    </button>
                  )}
                  {s.conversationCycleId !== "c-000" && s.status !== "PENDING_REVIEW" && (
                    <Link
                      href={`/conversas/${s.conversationCycleId}`}
                      className="text-micro font-medium text-brand-500 hover:underline"
                    >
                      Ver conversa
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
