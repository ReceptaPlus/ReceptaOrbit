/* Dados de município (população IBGE Censo 2022 + capital) usados pela análise
   regional do Simulador. Pequeno dataset curado — cobre as farmácias atuais + as de
   seed. Município fora da lista → known:false (o Simulador cai na referência nacional). */

export interface MunicipioData {
  city: string;
  uf: string;
  population: number; // IBGE — Censo 2022
  isCapital: boolean;
}

export const MUNICIPIOS: MunicipioData[] = [
  { city: "São José dos Campos", uf: "SP", population: 697_428, isCapital: false },
  { city: "Tupã", uf: "SP", population: 63_136, isCapital: false },
  { city: "Palmas", uf: "TO", population: 302_692, isCapital: true },
  // Municípios do seed de dev:
  { city: "Campinas", uf: "SP", population: 1_139_047, isCapital: false },
  { city: "São Paulo", uf: "SP", population: 11_451_245, isCapital: true },
];

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Busca por cidade + UF (normalizado, sem acento/caixa). Null se não estiver no dataset. */
export function findMunicipio(city: string | null, uf: string | null): MunicipioData | null {
  if (!city) return null;
  const c = normalize(city);
  const u = uf ? normalize(uf) : null;
  return (
    MUNICIPIOS.find((m) => normalize(m.city) === c && (u === null || normalize(m.uf) === u)) ?? null
  );
}
