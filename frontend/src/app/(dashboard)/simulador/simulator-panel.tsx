"use client";

import { useMemo, useState, type CSSProperties, type ComponentType, type ReactNode } from "react";
import { AreaChart } from "@/components/charts/area-chart";
import { IconAlert, IconPin, IconSettings, IconTrend } from "@/components/icons";
import { runSimulator } from "@/modules/simulator/engine";
import { getRegionalProfile, regionalBenchmarks, porteTip, type RegionalProfile } from "@/modules/simulator/regional";
import { SIMULATOR_BENCHMARKS } from "@/lib/constants";
import type { SimulatorInputs, SimulatorSeed, Dor, Benchmarks } from "@/modules/simulator/types";

/* Painel do Simulador — recálculo ao vivo (engine puro) sobre os sliders. Tudo em
   REAIS. Server só entrega o seed; nenhuma chamada de dados acontece aqui. */

const brl = (v: number, digits = 0) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: digits, maximumFractionDigits: digits });
const brlShort = (v: number) => (v >= 1000 ? `R$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : `R$${v.toFixed(0)}`);
const pct = (v: number, digits = 0) => `${(v * 100).toFixed(digits)}%`;
const num = (v: number) => Math.round(v).toLocaleString("pt-BR");

export function SimulatorPanel({ seed }: { seed: SimulatorSeed }) {
  const [inputs, setInputs] = useState<SimulatorInputs>(seed.inputs);

  // Análise do município: perfil regional → benchmarks LOCAIS que calibram as dores.
  const { profile, bench } = useMemo(() => {
    const p = getRegionalProfile(seed.city, seed.uf);
    return { profile: p, bench: regionalBenchmarks(SIMULATOR_BENCHMARKS, p) };
  }, [seed.city, seed.uf]);

  const result = useMemo(() => runSimulator(inputs, bench), [inputs, bench]);

  const set = <K extends keyof SimulatorInputs>(key: K, value: number) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const investMax = Math.max(Math.round(seed.inputs.monthlyInvestment * 3), 20000);
  // Máximos dinâmicos p/ o valor real caber no slider (ex.: ticket real > 500).
  const ticketMax = Math.max(1000, Math.ceil((seed.inputs.ticket * 2) / 100) * 100);
  const cplMax = Math.max(100, Math.ceil((seed.inputs.cpl * 2) / 10) * 10);

  // Origem de cada número — honestidade sobre o que é real vs estimado.
  const notes: string[] = [];
  if (!seed.hasAds) notes.push("Sem Agente de mídia conectado: CPL e investimento começam em estimativas.");
  if (!seed.hasConversionData) notes.push("IA ainda não analisou conversas: conversão e ticket médio são estimativas.");
  if (!seed.retentionIsProxy) notes.push(`Retenção é estimada (amostra de recompra insuficiente: ${seed.buyersSample} compradores).`);

  const growthData = result.growth.map((g) => ({
    inv: brlShort(g.investment),
    Faturamento: Math.round(g.revenue),
  }));

  const projData = result.projection.map((p) => ({
    mes: `M${p.month}`,
    "Com fidelização": Math.round(p.comFidelizacao),
    "Sem fidelização": Math.round(p.semFidelizacao),
  }));

  const projGain = result.projection[11]
    ? result.projection[11].comFidelizacao - result.projection[11].semFidelizacao
    : 0;

  return (
    <div className="space-y-6">
      {/* HERO — resultado protagonista (grau de apresentação) */}
      <section className="relative overflow-hidden rounded-xl border border-brand-100 animate-fade-in">
        <span aria-hidden className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-cream-alt/50" />
        <span
          aria-hidden
          className="absolute inset-0 bg-repeat opacity-[0.05]"
          style={{ backgroundImage: "url('/brand/pattern-t-orange.svg')", backgroundSize: "220px" }}
        />
        <span aria-hidden className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-brand-400/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-micro font-semibold text-brand-600 ring-1 ring-brand-100 backdrop-blur">
              <IconPin size={13} />
              {profile ? `${profile.city}${profile.uf ? `, ${profile.uf}` : ""}` : "Sua farmácia"}
              {profile?.isCapital ? " · capital" : ""}
            </span>
            <p className="mt-4 text-caption font-medium text-secondary">Faturamento projetado por mês</p>
            <p className="mt-1 font-display text-[2.5rem] font-bold leading-none tracking-tight text-brand-600 sm:text-[3rem]" data-numeric>
              {brl(result.faturamentoMes)}
            </p>
            <p className="mt-3 max-w-md text-small text-secondary">
              Com {brl(inputs.monthlyInvestment)}/mês em anúncios, {pct(inputs.conversionRate, 1)} de conversão e ticket
              médio de {brl(inputs.ticket)}.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:w-[24rem]">
            <HeroStat label="Leads / mês" value={num(result.leadsMes)} />
            <HeroStat label="Vendas / mês" value={num(result.vendasMes)} />
            <HeroStat label="LTV" value={brl(result.ltv)} accent />
          </div>
        </div>
      </section>

      {notes.length > 0 && (
        <div className="animate-fade-in flex gap-3 rounded-xl border border-line bg-cream-alt/40 p-4">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-warning-bg text-warning-text">
            <IconAlert size={14} />
          </span>
          <div>
            <p className="text-caption font-semibold text-ink">Base do simulador</p>
            <ul className="mt-1 space-y-1">
              {notes.map((n) => (
                <li key={n} className="text-caption text-secondary">{n}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Deck de controles */}
        <section className="card-premium animate-fade-in-up space-y-5 p-6 lg:col-span-2">
          <CardTitle
            icon={IconSettings}
            title="Parâmetros"
            action={
              <button
                type="button"
                onClick={() => setInputs(seed.inputs)}
                className="rounded-md px-2 py-1 text-caption font-medium text-brand-500 transition-colors hover:bg-brand-50 hover:text-brand-600 active:translate-y-px"
              >
                Restaurar reais
              </button>
            }
          />

          <Slider label="Investimento em ads / mês" value={inputs.monthlyInvestment} min={0} max={investMax} step={100}
            display={brl(inputs.monthlyInvestment)} source={seed.hasAds ? "Ads" : "estimado"} onChange={(v) => set("monthlyInvestment", v)} />
          <Slider label="CPL (custo por lead)" value={inputs.cpl} min={1} max={cplMax} step={1}
            display={brl(inputs.cpl, 2)} source={seed.hasAds ? "Ads" : "estimado"} onChange={(v) => set("cpl", v)} />
          <Slider label="Taxa de conversão" value={inputs.conversionRate} min={0} max={0.6} step={0.005}
            display={pct(inputs.conversionRate, 1)} source={seed.hasConversionData ? "IA" : "estimado"} onChange={(v) => set("conversionRate", v)} />
          <Slider label="Ticket médio" value={inputs.ticket} min={10} max={ticketMax} step={5}
            display={brl(inputs.ticket, 2)} source={seed.hasConversionData ? "IA" : "estimado"} onChange={(v) => set("ticket", v)} />
          <Slider label="Retenção (recompra mensal)" value={inputs.retentionRate} min={0} max={0.9} step={0.01}
            display={pct(inputs.retentionRate)} source={seed.retentionIsProxy ? "dados" : "estimado"} onChange={(v) => set("retentionRate", v)} />
        </section>

        {/* Gráficos */}
        <div className="space-y-5 lg:col-span-3">
          <section className="card-premium animate-fade-in-up p-6">
            <CardTitle
              icon={IconTrend}
              title="Crescimento × investimento"
              action={<span className="text-caption text-muted">faturamento/mês projetado</span>}
            />
            <AreaChart
              data={growthData}
              xKey="inv"
              series={[{ key: "Faturamento", label: "Faturamento/mês", color: "#D4432C" }]}
              height={248}
              format={(v) => brl(v)}
            />
            <p className="mt-3 text-micro text-muted">
              Cada nível de investimento → leads (÷ CPL) → vendas (× conversão) → faturamento (× ticket).
            </p>
          </section>

          <section className="card-premium animate-fade-in-up p-6">
            <CardTitle
              icon={IconTrend}
              title="Projeção 12 meses"
              action={
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-micro font-semibold text-brand-600">
                  +{brl(projGain)}/mês no M12 c/ fidelização
                </span>
              }
            />
            <AreaChart
              data={projData}
              xKey="mes"
              series={[
                { key: "Com fidelização", label: "Com fidelização", color: "#D4432C" },
                { key: "Sem fidelização", label: "Sem fidelização", color: "#A89E99" },
              ]}
              height={248}
              format={(v) => brl(v)}
            />
            <p className="mt-3 text-micro text-muted">
              A curva superior soma clientes retidos à base a cada mês. A distância entre as curvas é o
              impacto da fidelização.
            </p>
          </section>
        </div>
      </div>

      {/* Dores + Município lado a lado no desktop */}
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card-premium animate-fade-in-up p-6">
          <CardTitle
            icon={IconAlert}
            title="Dores detectadas"
            iconClass={result.dores.length === 0 ? "bg-success-bg text-success-text" : "bg-danger-bg text-danger-text"}
            action={
              <span className="text-caption text-muted">
                {result.dores.length === 0
                  ? "tudo dentro da meta"
                  : `${result.dores.length} ${result.dores.length === 1 ? "ponto" : "pontos"} de atenção`}
              </span>
            }
          />
          {result.dores.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg border border-success-text/20 bg-success-bg/40 p-4">
              <span className="text-small font-medium text-success-text">
                Nenhuma dor crítica neste cenário. Indicadores dentro das metas.
              </span>
            </div>
          ) : (
            <div className="grid gap-3">
              {result.dores.map((d) => (
                <DorCard key={d.key} dor={d} />
              ))}
            </div>
          )}
        </section>

        <MunicipioAnalysis profile={profile} bench={bench} inputs={inputs} />
      </div>
    </div>
  );
}

function HeroStat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg border p-3.5 backdrop-blur ${accent ? "border-brand-200 bg-brand-50/80" : "border-line bg-white/70"}`}>
      <p className="text-micro font-medium text-secondary">{label}</p>
      <p className={`mt-1 font-display text-title font-bold ${accent ? "text-brand-600" : "text-ink"}`} data-numeric>
        {value}
      </p>
    </div>
  );
}

function CardTitle({
  icon: Icon, title, action, iconClass = "bg-brand-50 text-brand-500",
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  action?: ReactNode;
  iconClass?: string;
}) {
  return (
    <header className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
          <Icon size={15} />
        </span>
        <h2 className="font-display text-subtitle font-semibold text-ink">{title}</h2>
      </div>
      {action}
    </header>
  );
}

function Slider({
  label, value, min, max, step, display, source, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  display: string; source: string; onChange: (v: number) => void;
}) {
  const estimated = source === "estimado";
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-small font-medium text-ink">{label}</label>
        <span className="rounded-md bg-brand-50 px-2 py-0.5 font-display text-small font-bold text-brand-600" data-numeric>
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-premium mt-2.5"
        style={{ "--pct": `${fill}%` } as CSSProperties}
        aria-label={label}
      />
      <span className={`mt-1.5 inline-block text-micro font-medium ${estimated ? "text-muted" : "text-success-text"}`}>
        {estimated ? "estimado" : `fonte: ${source}`}
      </span>
    </div>
  );
}

const PORTE_STYLE: Record<string, string> = {
  pequeno: "bg-info-bg text-info-text",
  médio: "bg-info-bg text-info-text",
  grande: "bg-warning-bg text-warning-text",
  metrópole: "bg-brand-50 text-brand-600",
  desconhecido: "bg-cream-alt text-muted",
};

function MunicipioAnalysis({
  profile, bench, inputs,
}: {
  profile: RegionalProfile | null;
  bench: Benchmarks;
  inputs: SimulatorInputs;
}) {
  if (!profile) {
    return (
      <section className="card-premium animate-fade-in-up p-6">
        <CardTitle icon={IconPin} title="Análise do município" iconClass="bg-cream-alt text-muted" />
        <p className="text-caption text-secondary">
          Município não cadastrado. Informe a cidade da farmácia no cadastro (admin) para habilitar a
          análise regional.
        </p>
      </section>
    );
  }

  return (
    <section className="card-premium animate-fade-in-up p-6">
      <CardTitle
        icon={IconPin}
        title="Análise do município"
        action={
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-micro font-semibold capitalize ${PORTE_STYLE[profile.porte]}`}>
            {profile.porte === "desconhecido" ? "porte desconhecido" : `porte ${profile.porte}`}
          </span>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-small font-semibold text-brand-600">
          <IconPin size={13} />
          {profile.city}{profile.uf ? `, ${profile.uf}` : ""}
        </span>
        {profile.population != null && (
          <span className="text-caption text-secondary" data-numeric>
            {num(profile.population)} hab. <span className="text-muted">(IBGE 2022)</span>
          </span>
        )}
      </div>

      {/* Benchmarks LOCAIS — o que é saudável NESTA praça (calibra as dores acima). */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <LocalBench label="CPL saudável (mercado local)" atual={inputs.cpl} meta={bench.cplMax} cmp="max" />
        <LocalBench label="Ticket ideal (mercado local)" atual={inputs.ticket} meta={bench.ticketMin} cmp="min" />
      </div>

      <p className="mt-4 text-caption text-secondary">{porteTip(profile.porte)}</p>

      {!profile.known && (
        <p className="mt-2 text-micro text-muted">
          Sem dados de mercado para este município. Usando referência nacional. Conversão e retenção não
          variam por praça (dependem da operação).
        </p>
      )}
    </section>
  );
}

function LocalBench({
  label, atual, meta, cmp,
}: {
  label: string; atual: number; meta: number; cmp: "max" | "min";
}) {
  const ok = cmp === "max" ? atual <= meta : atual >= meta;
  return (
    <div className="rounded-lg border border-line-subtle bg-white/50 p-4">
      <p className="text-caption text-muted">{label}</p>
      <p className="mt-1 font-display text-subtitle font-bold text-ink" data-numeric>
        {cmp === "max" ? "≤ " : "≥ "}{brl(meta)}
      </p>
      <p className={`mt-1 text-micro font-semibold ${ok ? "text-success-text" : "text-danger-text"}`}>
        seu valor: {brl(atual, 2)} {ok ? "· dentro" : "· fora"}
      </p>
    </div>
  );
}

function DorCard({ dor }: { dor: Dor }) {
  const fmt = (v: number) => (dor.unit === "brl" ? brl(v, 2) : pct(v, dor.unit === "pct" ? 1 : 0));
  return (
    <div className="rounded-lg border border-danger-bg bg-danger-bg/30 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-small font-semibold text-danger-text">{dor.label}</p>
        <span className="text-caption font-semibold text-danger-text" data-numeric>{fmt(dor.value)}</span>
      </div>
      <p className="mt-0.5 text-micro text-muted">
        Atual {fmt(dor.value)} · meta {dor.key === "cpl" ? "≤" : "≥"} {fmt(dor.benchmark)}
      </p>
      <p className="mt-1.5 text-caption text-secondary">{dor.hint}</p>
    </div>
  );
}
