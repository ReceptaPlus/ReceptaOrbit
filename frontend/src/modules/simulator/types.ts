/* Contratos do Simulador de crescimento (V1).
   Todo dinheiro aqui é em REAIS (float), não centavos — o simulador é uma projeção
   editável ao vivo, não um registro contábil. A formatação p/ exibição fica na UI. */

export type DorKey = "cpl" | "conversao" | "ticket" | "retencao";

/** Limiares que disparam as dores. Base nacional (SIMULATOR_BENCHMARKS) ou ajustada
    ao mercado local (regional.ts). Números mutáveis — a versão regional recalcula. */
export interface Benchmarks {
  cplMax: number;
  conversionMin: number;
  ticketMin: number;
  retentionMin: number;
}

/** Parâmetros que o usuário ajusta nos sliders (ponto de partida vem do seed real). */
export interface SimulatorInputs {
  monthlyInvestment: number; // R$/mês em anúncios
  cpl: number; // R$ por lead (custo por lead)
  conversionRate: number; // 0..1 — leads que viram venda
  ticket: number; // R$ — ticket médio
  retentionRate: number; // 0..1 — recompra mensal (fidelização)
}

/** Ponto de partida REAL da farmácia, já derivado dos dados. */
export interface SimulatorSeed {
  hasAds: boolean; // Agente-Meta-Ads configurado? (CPL/investimento reais)
  hasConversionData: boolean; // IA já analisou conversas? (conversão/ticket reais)
  periodDays: number; // janela usada p/ derivar o seed
  adConversions: number; // leads no período (conversions Meta+Google — banco central)
  inputs: SimulatorInputs; // valores iniciais dos sliders
  retentionIsProxy: boolean; // true = retenção veio de dado; false = default
  buyersSample: number; // nº de compradores usados no proxy de retenção
  city: string | null; // município da farmácia (contexto da análise; null se não cadastrado)
  uf: string | null; // UF da farmácia
}

export interface GrowthPoint {
  investment: number; // R$/mês
  leads: number;
  sales: number;
  revenue: number; // R$/mês
}

export interface MonthPoint {
  month: number; // 1..12
  comFidelizacao: number; // faturamento do mês COM recompra (R$)
  semFidelizacao: number; // faturamento do mês SÓ com clientes novos (R$)
  clientesAtivos: number; // compradores no mês (novos + retidos)
}

export interface Dor {
  key: DorKey;
  label: string;
  value: number; // valor atual do indicador
  benchmark: number; // meta/limite
  unit: "brl" | "pct";
  hint: string; // recomendação curta de ação
}

export interface SimulatorResult {
  leadsMes: number;
  vendasMes: number;
  faturamentoMes: number; // R$/mês no investimento atual
  ltv: number; // R$ — valor do cliente ao longo do tempo (com retenção)
  growth: GrowthPoint[]; // faturamento vs investimento (0 → 3×)
  projection: MonthPoint[]; // 12 meses (com/sem fidelização)
  dores: Dor[]; // dores disparadas por benchmark
}
