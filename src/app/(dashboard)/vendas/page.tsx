import Link from "next/link";
import { dashboard, formatBRL, formatDate, sales } from "@/lib/mock-data";
import { ConfidencePill, SaleStatusBadge, SourceBadge } from "@/components/badges";
import { KpiCard } from "@/components/feedback/kpi-card";

export default function VendasPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-display font-bold font-display">Vendas</h1>
          <p className="text-small text-secondary mt-1">
            Vendas identificadas por IA, integração ou registro manual.
          </p>
        </div>
        <div className="flex gap-2">
          {["Período", "Origem", "Status", "Produto"].map((f) => (
            <button
              key={f}
              className="rounded-lg border border-line bg-card px-3 py-1.5 text-small text-secondary hover:border-primary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {f} ▾
            </button>
          ))}
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total vendido" value={formatBRL(dashboard.totalSoldCents)} />
        <KpiCard label="Vendas confirmadas" value={String(dashboard.confirmedSalesCount)} />
        <KpiCard label="Ticket médio" value={formatBRL(dashboard.avgTicketCents)} />
        <KpiCard label="Pendentes de revisão" value={String(dashboard.pendingReviewCount)} highlight />
      </section>

      <div className="bg-card rounded-xl border border-line overflow-x-auto shadow-xs">
        <table className="w-full text-small tabular-nums">
          <thead>
            <tr className="text-left text-caption uppercase tracking-wide text-secondary bg-subtle border-b border-line">
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Origem</th>
              <th className="px-4 py-3 font-medium">Campanha</th>
              <th className="px-4 py-3 font-medium">Produtos</th>
              <th className="px-4 py-3 font-medium text-right">Valor</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Identificação</th>
              <th className="px-4 py-3 font-medium">Confiança</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line-subtle">
            {sales.map((s) => (
              <tr key={s.id} className="h-12 hover:bg-subtle transition-colors">
                <td className="px-4 py-3 font-medium">{s.contactName}</td>
                <td className="px-4 py-3 text-secondary">{formatDate(s.soldAt)}</td>
                <td className="px-4 py-3"><SourceBadge source={s.attributionSource} /></td>
                <td className="px-4 py-3 text-secondary">{s.campaignName ?? "—"}</td>
                <td className="px-4 py-3 text-secondary">
                  {s.items.map((i) => `${i.quantity}× ${i.productName}`).join(", ")}
                </td>
                <td className="px-4 py-3 text-right font-semibold">{formatBRL(s.netAmountCents)}</td>
                <td className="px-4 py-3"><SaleStatusBadge status={s.status} /></td>
                <td className="px-4 py-3 text-secondary">
                  {s.identificationSource === "AI" ? "IA" : s.identificationSource === "MANUAL" ? "Manual" : "Integração"}
                </td>
                <td className="px-4 py-3"><ConfidencePill value={s.confidence} /></td>
                <td className="px-4 py-3 text-right">
                  {s.status === "PENDING_REVIEW" && (
                    <button className="rounded-lg bg-primary text-white px-3 py-1.5 text-caption font-medium hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      Confirmar
                    </button>
                  )}
                  {s.conversationCycleId !== "c-000" && s.status !== "PENDING_REVIEW" && (
                    <Link
                      href={`/conversas/${s.conversationCycleId}`}
                      className="text-caption text-primary hover:underline"
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
