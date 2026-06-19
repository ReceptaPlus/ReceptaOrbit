import Link from "next/link";
import { getDashboardVolumeVM, getAdsCardsVM } from "@/modules/dashboard/queries";
import { listConversationsVM } from "@/modules/conversations/queries";
import { StatusBadge } from "@/components/badges";
import { WaitingBadge } from "@/components/waiting-badge";
import { BarChart } from "@/components/charts/bar-chart";
import type { ProviderMetrics } from "@/server/agente/ads";

function brl(reais: number): string {
  return reais.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function num(n: number): string {
  return n.toLocaleString("pt-BR");
}

export default async function DashboardPage() {
  const [vol, ads, cycles] = await Promise.all([
    getDashboardVolumeVM(),
    getAdsCardsVM(),
    listConversationsVM(),
  ]);
  const recent = cycles.slice(0, 5);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold font-display">Visão Geral</h1>
        <p className="text-sm text-secondary mt-1">Movimento de conversas dos últimos 7 dias.</p>
      </header>

      {/* KPIs de volume */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Conversas ativas" value={num(vol.activeConversations)} />
        <KpiCard label="Novos contatos (7d)" value={num(vol.newContacts7d)} />
        <KpiCard label="Mensagens (7d)" value={num(vol.messages7d)} />
        <KpiCard label="Encerradas (7d)" value={num(vol.closedCycles7d)} />
      </section>

      {/* Gráfico de mensagens/dia */}
      <section className="bg-card rounded-xl border border-line p-5">
        <h2 className="font-semibold font-display mb-4">Mensagens por dia</h2>
        <BarChart data={vol.msgsPerDay} height={150} />
      </section>

      {/* Anúncios (Meta + Google) — só aparece se houver dados do Agente */}
      {ads && (
        <section className="bg-card rounded-xl border border-line p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold font-display">Anúncios — últimos 7 dias</h2>
            <span className="text-xs text-muted">{ads.clientName}</span>
          </div>
          <div className="space-y-4">
            <ProviderRow title="Meta Ads" m={ads.meta} />
            <ProviderRow title="Google Ads" m={ads.google} />
          </div>
        </section>
      )}

      {/* Conversas recentes */}
      <section className="bg-card rounded-xl border border-line p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold font-display">Conversas recentes</h2>
          <Link href="/conversas" className="text-sm text-primary hover:underline">Ver todas</Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-secondary">Nenhuma conversa ainda.</p>
        ) : (
          <ul className="divide-y divide-line-subtle">
            {recent.map((c) => (
              <li key={c.id}>
                <Link href={`/conversas/${c.id}`} className="flex items-center gap-4 py-3 hover:bg-subtle -mx-2 px-2 rounded-lg">
                  <div className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                    {c.contactName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.contactName}</p>
                    <p className="text-xs text-secondary truncate">{c.lastMessagePreview}</p>
                  </div>
                  <WaitingBadge waiting={c.waiting} />
                  <StatusBadge status={c.status} />
                  <span className="text-xs text-muted shrink-0">{c.lastMessageTime}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card rounded-xl border border-line p-5">
      <p className="text-sm text-secondary">{label}</p>
      <p className="text-2xl font-bold font-display mt-1">{value}</p>
    </div>
  );
}

function ProviderRow({ title, m }: { title: string; m: ProviderMetrics }) {
  return (
    <div className="rounded-lg border border-line-subtle p-4">
      <p className="text-sm font-medium mb-3">{title}</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric label="Investido" value={brl(m.spend)} />
        <Metric label="Impressões" value={num(m.impressions)} />
        <Metric label="Cliques" value={num(m.clicks)} />
        <Metric label="Conversões" value={num(m.conversions)} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-secondary">{label}</p>
      <p className="text-lg font-bold font-display mt-0.5 tabular-nums">{value}</p>
    </div>
  );
}
