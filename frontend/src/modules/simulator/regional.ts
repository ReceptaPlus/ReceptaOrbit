/* Modelo regional do Simulador — funções PURAS. Traduz o município da farmácia em:
   · porte (do tamanho populacional),
   · índices de mercado (custo de mídia e ticket esperado),
   · benchmarks LOCAIS (ajustam CPL/ticket do detectDores para a realidade da praça).
   Os índices são HEURÍSTICOS (estimativa de mercado, não dado medido) — mercados maiores
   e capitais concentram anunciantes → CPL tende a subir; poder de compra tende a ser maior. */

import { findMunicipio } from "@/lib/geo/municipios";
import type { Benchmarks } from "./types";

export type Porte = "pequeno" | "médio" | "grande" | "metrópole" | "desconhecido";

export interface RegionalProfile {
  city: string;
  uf: string | null;
  known: boolean; // achou o município no dataset?
  population: number | null;
  isCapital: boolean;
  porte: Porte;
  costIndex: number; // multiplicador do CPL esperado (mídia mais cara em praça maior)
  ticketIndex: number; // multiplicador do ticket esperado (poder de compra)
}

function porteFromPopulation(pop: number | null): Porte {
  if (pop === null) return "desconhecido";
  if (pop < 50_000) return "pequeno";
  if (pop < 200_000) return "médio";
  if (pop < 800_000) return "grande";
  return "metrópole";
}

const COST_INDEX: Record<Porte, number> = {
  pequeno: 0.85,
  médio: 1.0,
  grande: 1.15,
  metrópole: 1.35,
  desconhecido: 1.0,
};
const TICKET_INDEX: Record<Porte, number> = {
  pequeno: 0.9,
  médio: 1.0,
  grande: 1.1,
  metrópole: 1.2,
  desconhecido: 1.0,
};

/** Perfil regional a partir do município da farmácia. Null se município não cadastrado. */
export function getRegionalProfile(city: string | null, uf: string | null): RegionalProfile | null {
  if (!city) return null;
  const m = findMunicipio(city, uf);
  const population = m?.population ?? null;
  const isCapital = m?.isCapital ?? false;
  const porte = porteFromPopulation(population);
  // Capital concentra mídia e renda → pequeno prêmio sobre o porte.
  const costIndex = COST_INDEX[porte] + (isCapital ? 0.1 : 0);
  const ticketIndex = TICKET_INDEX[porte] + (isCapital ? 0.05 : 0);
  return {
    city,
    uf,
    known: m !== null,
    population,
    isCapital,
    porte,
    costIndex,
    ticketIndex,
  };
}

/** Benchmarks locais: escala CPL e ticket pela praça. Conversão/retenção ficam nacionais
    (dependem de operação, não de mercado). Sem perfil → devolve os benchmarks base. */
export function regionalBenchmarks(base: Benchmarks, profile: RegionalProfile | null): Benchmarks {
  if (!profile) return base;
  return {
    ...base,
    cplMax: Math.round(base.cplMax * profile.costIndex),
    ticketMin: Math.round(base.ticketMin * profile.ticketIndex),
  };
}

/** Dica de estratégia conforme o porte do mercado. */
export function porteTip(porte: Porte): string {
  switch (porte) {
    case "pequeno":
      return "Mercado menor: CPL tende a ser baixo, mas o volume de leads também. Priorize conversão e retenção para extrair mais de cada contato.";
    case "médio":
      return "Mercado de porte médio: equilíbrio entre custo de mídia e volume. Consistência de atendimento define o resultado.";
    case "grande":
      return "Mercado grande: mais concorrência de mídia eleva o CPL. Invista em criativos e segmentação para não pagar caro por lead.";
    case "metrópole":
      return "Metrópole: CPL alto pela disputa de audiência. Ganho vem de diferenciação, ticket maior e recompra.";
    default:
      return "Sem dados de mercado para este município. Usando referência nacional; cadastre municípios conhecidos para calibrar melhor.";
  }
}
