import Link from "next/link";
import { KpiCard } from "@/components/kpi-card";
import { BarChart } from "@/components/charts/bar-chart";
import { IconCart, IconChat, IconUsers } from "@/components/icons";
import { getDashboardVolumeVM, getAdsCardsVM } from "@/modules/dashboard/queries";
import type { ProviderMetrics } from "@/server/agente/ads";

/* Dashboard operacional — V1 (ingestão, sem IA). Métricas REAIS de volume
   (conversas, contatos, mensagens) do tenant + cards de anúncio (Meta/Google) quando
   o Agente está configurado. Receita/atribuição/vendas chegam com o módulo de IA. */

const nf = (n: number) => n.toLocaleString("pt-BR");
const money = (n: number) => `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Card({ title, action, children, className = "" }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card-premium animate-fade-in-up p-5 ${className}`}>
      {(title || action) && (
        <header className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-display text-subtitle font-semibold text-ink">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

function AdsCard({ provider, m }: { provider: string; m: ProviderMetrics }) {
  const ctr = m.impressions > 0 ? (m.clicks / m.impressions) * 100 : 0;
  return (
    <div className="rounded-lg border border-line-subtle bg-white/50 p-4">
      <div className="flex items-center justify-between">
        <p className="font-display text-small font-semibold text-ink">{provider}</p>
        <span className="text-micro text-muted">7 dias</span>
      </div>
      <p className="mt-2 font-display text-title font-bold text-ink" data-numeric>{money(m.spend)}</p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-caption">
        <div><p className="text-muted">Impressões</p><p className="font-semibold text-ink" data-numeric>{nf(m.impressions)}</p></div>
        <div><p className="text-muted">Cliques</p><p className="font-semibold text-ink" data-numeric>{nf(m.clicks)}</p></div>
        <div><p className="text-muted">CTR</p><p className="font-semibold text-ink" data-numeric>{ctr.toFixed(1)}%</p></div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const [vol, ads] = await Promise.all([getDashboardVolumeVM(), getAdsCardsVM(7)]);

  const kpis = [
    { label: "Conversas abertas", value: nf(vol.activeConversations), hint: "ciclos ativos", accent: true, icon: <IconChat size={16} /> },
    { label: "Novos contatos", value: nf(vol.newContacts7d), hint: "últimos 7 dias", icon: <IconUsers size={16} /> },
    { label: "Mensagens", value: nf(vol.messages7d), hint: "últimos 7 dias", icon: <IconChat size={16} /> },
    { label: "Conversas encerradas", value: nf(vol.closedCycles7d), hint: "últimos 7 dias" },
  ];

  return (
    <div className="space-y-6">
      {/* Banner de boas-vindas */}
      <section className="card-premium animate-fade-in relative overflow-hidden p-0">
        <div className="relative flex items-stretch">
          <div className="relative z-10 flex-1 p-6 sm:p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-0.5 text-micro font-semibold text-brand-600">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 pulse-dot" />
              Sua farmácia em tempo real
            </span>
            <h1 className="mt-3 font-display text-display-lg font-bold tracking-tight text-ink">
              Conversas do WhatsApp, num só lugar
            </h1>
            <p className="mt-1.5 max-w-md text-body text-secondary">
              Acompanhe o volume de atendimento da sua farmácia. Atribuição de campanha e
              vendas entram com o módulo de IA.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/conversas" className="btn-primary !h-10 text-small">Ver conversas</Link>
              <Link href="/clientes" className="inline-flex h-10 items-center rounded-md border border-line bg-white/70 px-3.5 text-small font-medium text-secondary backdrop-blur transition-colors hover:border-brand-400 hover:text-brand-500">
                Ver clientes
              </Link>
            </div>
          </div>
          <div className="relative hidden w-[42%] max-w-md shrink-0 sm:block">
            <span className="absolute inset-0 z-10 bg-gradient-to-r from-white via-white/40 to-transparent" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/dashboard-banner.jpg"
              alt="Recepta — atendimento de farmácia"
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      <header className="animate-fade-in">
        <h2 className="font-display text-title font-bold tracking-tight text-ink">Dashboard operacional</h2>
        <p className="mt-1 text-body text-secondary">Volume de conversas e contatos do WhatsApp da sua farmácia.</p>
      </header>

      {/* KPIs reais de volume */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <KpiCard key={k.label} {...k} index={i} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Mensagens por dia (real) */}
        <Card title="Mensagens por dia" className="lg:col-span-2" action={<span className="text-caption text-muted">Últimos 7 dias</span>}>
          <BarChart data={vol.msgsPerDay} height={200} unit="msgs" />
        </Card>

        {/* Anúncios (real, via Agente) ou aviso */}
        <Card title="Investimento em anúncios">
          {ads ? (
            <div className="space-y-3">
              <AdsCard provider="Meta Ads" m={ads.meta} />
              <AdsCard provider="Google Ads" m={ads.google} />
            </div>
          ) : (
            <p className="text-caption text-secondary">
              Sem dados de anúncio para esta farmácia. Conecte o Agente de mídia para ver
              investimento e desempenho de Meta e Google Ads aqui.
            </p>
          )}
        </Card>
      </div>

      {/* Vendas/atribuição — dependem da IA */}
      <Card title="Vendas e atribuição">
        <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed border-line bg-cream-alt/30 p-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-info-bg px-2.5 py-0.5 text-micro font-semibold text-info-text">
            <IconCart size={13} /> Em breve
          </span>
          <p className="text-small font-medium text-ink">Receita, conversão e atribuição de campanha</p>
          <p className="max-w-xl text-caption text-secondary">
            Estas métricas nascem da análise das conversas pela IA (identificação de venda,
            origem e valor). Entram quando o módulo de vendas/IA for ativado.
          </p>
        </div>
      </Card>
    </div>
  );
}
