import Link from "next/link";
import { getDashboard } from "@/modules/dashboard/api";
import { formatBRL, formatTime } from "@/lib/format";
import { ROUTES } from "@/lib/constants";
import { SourceBadge, StageBadge } from "@/components/badges";
import { BarChart } from "@/components/charts/bar-chart";

export default function DashboardPage() {
  const dashboard = getDashboard();
  const recent = dashboard.recentCycles;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold font-display">Visão Geral</h1>
        <p className="text-sm text-secondary mt-1">Indicadores dos últimos 14 dias.</p>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total vendido" value={formatBRL(dashboard.totalSoldCents)} delta="+12% vs. período anterior" positive />
        <KpiCard label="Ticket médio" value={formatBRL(dashboard.avgTicketCents)} delta="+4% vs. período anterior" positive />
        <KpiCard label="Taxa de conversão" value={`${Math.round(dashboard.conversionRate * 100)}%`} delta="-2 p.p. vs. período anterior" />
        <Link href={ROUTES.revisao} className="block">
          <KpiCard label="Vendas pendentes de revisão" value={String(dashboard.pendingCount)} delta="Revisar agora →" neutral />
        </Link>
      </section>

      {/* Gráfico + Top produtos */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-line p-5">
          <h2 className="font-semibold font-display mb-4">Conversas por dia</h2>
          <BarChart
            data={dashboard.weekBars.map((v, i) => ({ label: `D${i + 1}`, value: v }))}
            height={150}
          />
        </div>

        <div className="bg-card rounded-xl border border-line p-5">
          <h2 className="font-semibold font-display mb-4">Produtos mais vendidos</h2>
          <ul className="space-y-3">
            {dashboard.topProducts.map((p) => (
              <li key={p.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{p.name}</span>
                  <span className="text-secondary">{p.qty} un.</span>
                </div>
                <div className="h-1.5 rounded-full bg-line-subtle overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${p.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Vendas por origem */}
      <section className="bg-card rounded-xl border border-line p-5">
        <h2 className="font-semibold font-display mb-4">Vendas por origem</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboard.salesBySource.map((s) => (
            <div key={s.source} className="rounded-lg border border-line-subtle p-4">
              <SourceBadge source={s.source} />
              <p className="text-lg font-bold font-display mt-2">{formatBRL(s.totalCents)}</p>
              <p className="text-xs text-secondary">{s.count} venda{s.count === 1 ? "" : "s"} confirmada{s.count === 1 ? "" : "s"}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Conversas recentes */}
      <section className="bg-card rounded-xl border border-line p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold font-display">Conversas recentes</h2>
          <Link href="/conversas" className="text-sm text-primary hover:underline">Ver todas</Link>
        </div>
        <ul className="divide-y divide-line-subtle">
          {recent.map((c) => (
            <li key={c.id}>
              <Link href={`/conversas/${c.id}`} className="flex items-center gap-4 py-3 hover:bg-subtle -mx-2 px-2 rounded-lg">
                <div className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                  {c.contactName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.contactName}</p>
                  <p className="text-xs text-secondary truncate">{c.aiSummary}</p>
                </div>
                <StageBadge stage={c.stage} />
                <span className="text-xs text-muted shrink-0">{formatTime(c.lastMessageAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function KpiCard({
  label, value, delta, positive, neutral,
}: {
  label: string; value: string; delta: string; positive?: boolean; neutral?: boolean;
}) {
  return (
    <div className="bg-card rounded-xl border border-line p-5">
      <p className="text-sm text-secondary">{label}</p>
      <p className="text-2xl font-bold font-display mt-1">{value}</p>
      <p className={`text-xs mt-1 ${neutral ? "text-secondary" : positive ? "text-success-text" : "text-danger-text"}`}>
        {delta}
      </p>
    </div>
  );
}
