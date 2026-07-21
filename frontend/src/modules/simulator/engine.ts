/* Motor do Simulador — funções PURAS (sem I/O, sem React). Roda no server (seed) e no
   client (recálculo ao vivo nos sliders). Testável isoladamente. Dinheiro em REAIS. */

import { SIMULATOR_BENCHMARKS } from "@/lib/constants";
import type {
  Benchmarks,
  Dor,
  GrowthPoint,
  MonthPoint,
  SimulatorInputs,
  SimulatorResult,
} from "./types";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Leads gerados por um investimento, dado o CPL. */
export function leadsFrom(investment: number, cpl: number): number {
  return cpl > 0 ? investment / cpl : 0;
}

/** Vendas a partir dos leads e da taxa de conversão. */
export function salesFrom(leads: number, conversionRate: number): number {
  return leads * clamp01(conversionRate);
}

/** Faturamento a partir das vendas e do ticket médio. */
export function revenueFrom(sales: number, ticket: number): number {
  return sales * ticket;
}

/** LTV mensal simplificado: ticket × soma geométrica das recompras (retenção r).
    r→1 tenderia ao infinito; teto em 1000× o ticket p/ não estourar gráfico/UI. */
export function ltvFrom(ticket: number, retentionRate: number): number {
  const r = clamp01(retentionRate);
  if (r >= 0.999) return ticket * 1000;
  return ticket * (1 / (1 - r));
}

/** Curva faturamento × investimento: varia o investimento de 0 até maxMultiple× o atual.
    Sem investimento base (farmácia sem Agente), usa uma escala default p/ não achatar. */
export function growthCurve(inputs: SimulatorInputs, steps = 6, maxMultiple = 3): GrowthPoint[] {
  const base = inputs.monthlyInvestment > 0 ? inputs.monthlyInvestment : 5000;
  const top = base * maxMultiple;
  const points: GrowthPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const investment = (top / steps) * i;
    const leads = leadsFrom(investment, inputs.cpl);
    const sales = salesFrom(leads, inputs.conversionRate);
    points.push({ investment, leads, sales, revenue: revenueFrom(sales, inputs.ticket) });
  }
  return points;
}

/** Projeção de 12 meses. Novos clientes/mês (N) constantes pelo investimento; a base
    acumula com a retenção. Duas curvas: COM fidelização (novos + retidos) e SEM
    (só os novos, faturamento estável) — a diferença É o impacto da fidelização. */
export function projection12m(inputs: SimulatorInputs): MonthPoint[] {
  const novosPorMes = salesFrom(leadsFrom(inputs.monthlyInvestment, inputs.cpl), inputs.conversionRate);
  const r = clamp01(inputs.retentionRate);
  const points: MonthPoint[] = [];
  let ativos = 0;
  for (let month = 1; month <= 12; month++) {
    ativos = ativos * r + novosPorMes; // compradores no mês = retidos + novos
    points.push({
      month,
      comFidelizacao: ativos * inputs.ticket,
      semFidelizacao: novosPorMes * inputs.ticket,
      clientesAtivos: ativos,
    });
  }
  return points;
}

/** Dores disparadas quando um indicador cruza o benchmark. */
export function detectDores(inputs: SimulatorInputs, bench: Benchmarks = SIMULATOR_BENCHMARKS): Dor[] {
  const dores: Dor[] = [];
  if (inputs.cpl > bench.cplMax) {
    dores.push({
      key: "cpl", label: "CPL caro", value: inputs.cpl, benchmark: bench.cplMax, unit: "brl",
      hint: "Custo por lead acima do saudável. Reveja segmentação e criativos, ou canais mais baratos.",
    });
  }
  if (inputs.conversionRate < bench.conversionMin) {
    dores.push({
      key: "conversao", label: "Taxa de conversão baixa", value: inputs.conversionRate, benchmark: bench.conversionMin, unit: "pct",
      hint: "Poucos leads viram venda. Reduza o tempo de resposta e melhore o atendimento no WhatsApp.",
    });
  }
  if (inputs.ticket < bench.ticketMin) {
    dores.push({
      key: "ticket", label: "Ticket médio baixo", value: inputs.ticket, benchmark: bench.ticketMin, unit: "brl",
      hint: "Aumente com combos, upsell e itens de maior margem no atendimento.",
    });
  }
  if (inputs.retentionRate < bench.retentionMin) {
    dores.push({
      key: "retencao", label: "Retenção baixa", value: inputs.retentionRate, benchmark: bench.retentionMin, unit: "pct",
      hint: "Clientes não voltam. Ative recompra: lembretes, programa de fidelidade e recorrência.",
    });
  }
  return dores;
}

/** Roda o simulador inteiro a partir dos inputs. */
export function runSimulator(inputs: SimulatorInputs, bench: Benchmarks = SIMULATOR_BENCHMARKS): SimulatorResult {
  const leadsMes = leadsFrom(inputs.monthlyInvestment, inputs.cpl);
  const vendasMes = salesFrom(leadsMes, inputs.conversionRate);
  return {
    leadsMes,
    vendasMes,
    faturamentoMes: revenueFrom(vendasMes, inputs.ticket),
    ltv: ltvFrom(inputs.ticket, inputs.retentionRate),
    growth: growthCurve(inputs),
    projection: projection12m(inputs),
    dores: detectDores(inputs, bench),
  };
}
