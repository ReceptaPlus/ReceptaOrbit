"use client";

import Link from "next/link";
import { KpiCard } from "@/components/kpi-card";
import { AreaChart } from "@/components/charts/area-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { IconCart, IconChat, IconUsers } from "@/components/icons";

/* Dashboard operacional — espelha o protótipo premium (Lovable). Dados fictícios
   (modo demo). A informação é protagonista; a atmosfera fica no fundo. */

const KPIS = [
  { label: "Conversas abertas", value: "248", delta: { value: "12%", direction: "up" as const }, hint: "vs. 7d", accent: true, icon: <IconChat size={16} /> },
  { label: "Conversas encerradas", value: "1.082", delta: { value: "4.8%", direction: "up" as const }, hint: "vs. 7d" },
  { label: "Conversão", value: "18.4%", delta: { value: "1.9pp", direction: "up" as const }, hint: "vs. 7d" },
  { label: "Receita total", value: "R$ 113,7K", delta: { value: "22%", direction: "up" as const }, hint: "vs. 7d", accent: true, icon: <IconCart size={16} /> },
  { label: "Ticket médio", value: "R$ 184", delta: { value: "2.1%", direction: "down" as const }, hint: "vs. 7d" },
  { label: "Vendas confirmadas", value: "612", delta: { value: "8.4%", direction: "up" as const }, hint: "vs. 7d" },
  { label: "Vendas pendentes", value: "47", delta: { value: "12%", direction: "down" as const }, hint: "aguardando" },
  { label: "Clientes ativos", value: "3.412", delta: { value: "5.6%", direction: "up" as const }, hint: "no mês", accent: true, icon: <IconUsers size={16} /> },
];

const REVENUE = [
  { dia: "14/06", receita: 12.4, comissao: 1.9 },
  { dia: "15/06", receita: 14.1, comissao: 2.1 },
  { dia: "16/06", receita: 13.2, comissao: 2.0 },
  { dia: "17/06", receita: 16.8, comissao: 2.5 },
  { dia: "18/06", receita: 18.9, comissao: 2.8 },
  { dia: "19/06", receita: 17.3, comissao: 2.6 },
  { dia: "20/06", receita: 20.9, comissao: 3.1 },
];

const ORIGEM = [
  { label: "Meta Ads", value: 268, color: "#D4432C" },
  { label: "Google Ads", value: 184, color: "#D97055" },
  { label: "Instagram", value: 96, color: "#6FAF8F" },
  { label: "WhatsApp", value: 64, color: "#E89580" },
];

const CONFIRMADAS = [
  { label: "14/06", value: 74 },
  { label: "15/06", value: 82 },
  { label: "16/06", value: 79 },
  { label: "17/06", value: 96 },
  { label: "18/06", value: 108 },
  { label: "19/06", value: 91 },
  { label: "20/06", value: 112 },
];

const CAMPANHAS = [
  { campanha: "Genéricos Junho", origem: "Meta Ads", conversao: "21.4%", receita: "R$ 38,2K", up: true },
  { campanha: "Vitaminas Search", origem: "Google Ads", conversao: "18.9%", receita: "R$ 27,5K", up: true },
  { campanha: "Remarketing Maio", origem: "Meta Ads", conversao: "14.2%", receita: "R$ 19,8K", up: false },
  { campanha: "Marca Institucional", origem: "Google Ads", conversao: "11.7%", receita: "R$ 12,1K", up: true },
];

const ALERTAS = [
  { tone: "warning", title: "8 classificações de baixa confiança", desc: "Conversas abaixo do limiar de 85% aguardam revisão manual." },
  { tone: "info", title: "Pico de demanda em Genéricos", desc: "Volume 34% acima da média nas últimas 24h — considere reforçar estoque." },
  { tone: "danger", title: "12 vendas pendentes há +24h", desc: "Confirmação automática expirou. Revise para não perder atribuição." },
];

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

export default function DashboardPage() {
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
              Bem-vinda, Camila
            </h1>
            <p className="mt-1.5 max-w-md text-body text-secondary">
              Conversas do WhatsApp viram vendas, atribuição de campanha e clientes recorrentes —
              tudo num só lugar.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/conversas" className="btn-primary !h-10 text-small">Ver conversas</Link>
              <Link href="/vendas" className="inline-flex h-10 items-center rounded-md border border-line bg-white/70 px-3.5 text-small font-medium text-secondary backdrop-blur transition-colors hover:border-brand-400 hover:text-brand-500">
                Relatório de vendas
              </Link>
            </div>
          </div>
          {/* Imagem da marca (some no mobile p/ não brigar com o texto) */}
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
        <p className="mt-1 text-body text-secondary">Visão consolidada de conversas, vendas e performance comercial.</p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPIS.map((k, i) => (
          <KpiCard key={k.label} {...k} index={i} />
        ))}
      </div>

      {/* Receita + Origem */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Evolução de receita" className="lg:col-span-2" action={<span className="text-caption text-muted">Receita vs. comissões — 7 dias (R$ mil)</span>}>
          <AreaChart
            data={REVENUE}
            xKey="dia"
            series={[
              { key: "receita", label: "Receita", color: "#D4432C" },
              { key: "comissao", label: "Comissões", color: "#6FAF8F" },
            ]}
            format={(v) => `R$ ${v.toFixed(1)}K`}
          />
        </Card>
        <Card title="Vendas por origem" action={<span className="text-caption text-muted">Distribuição</span>}>
          <DonutChart data={ORIGEM} />
        </Card>
      </div>

      {/* Campanhas + Alertas */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Performance comercial por campanha" className="lg:col-span-2">
          <div className="overflow-hidden">
            <table className="w-full text-small">
              <thead>
                <tr className="border-b border-line text-left text-caption uppercase tracking-wide text-muted">
                  <th className="pb-2.5 font-medium">Campanha</th>
                  <th className="pb-2.5 font-medium">Origem</th>
                  <th className="pb-2.5 font-medium text-right">Conversão</th>
                  <th className="pb-2.5 font-medium text-right">Receita</th>
                </tr>
              </thead>
              <tbody>
                {CAMPANHAS.map((c) => (
                  <tr key={c.campanha} className="border-b border-line-subtle transition-colors last:border-0 hover:bg-cream-alt/50">
                    <td className="py-3 font-medium text-ink">{c.campanha}</td>
                    <td className="py-3 text-secondary">{c.origem}</td>
                    <td className="py-3 text-right" data-numeric>
                      <span className={c.up ? "text-success-text" : "text-danger-text"}>{c.up ? "▲" : "▼"} {c.conversao}</span>
                    </td>
                    <td className="py-3 text-right font-semibold text-ink" data-numeric>{c.receita}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Alertas da IA">
          <ul className="space-y-3">
            {ALERTAS.map((a) => {
              const tone =
                a.tone === "warning"
                  ? "bg-warning-bg text-warning-text"
                  : a.tone === "danger"
                    ? "bg-danger-bg text-danger-text"
                    : "bg-info-bg text-info-text";
              return (
                <li key={a.title} className="flex gap-3 rounded-lg border border-line-subtle bg-white/40 p-3">
                  <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-caption font-bold ${tone}`}>!</span>
                  <div className="min-w-0">
                    <p className="text-small font-medium text-ink">{a.title}</p>
                    <p className="mt-0.5 text-caption text-secondary">{a.desc}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* Confirmadas por dia */}
      <Card title="Vendas confirmadas por dia" action={<Link href="/vendas" className="text-caption font-medium text-brand-500 hover:text-brand-600">Ver vendas →</Link>}>
        <BarChart data={CONFIRMADAS} height={200} unit="vendas" />
      </Card>
    </div>
  );
}
