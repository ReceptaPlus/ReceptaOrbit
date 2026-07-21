import { getSimulatorSeed } from "@/modules/simulator/queries";
import { SimulatorPanel } from "./simulator-panel";

/* Simulador de crescimento (V1: Dados). Puxa o ponto de partida REAL da farmácia
   (CPL do banco central, conversão/ticket da IA, retenção proxy) e deixa o usuário
   projetar cenários ao vivo com sliders. Cálculo roda no client (engine puro). */

export const metadata = {
  title: "Simulador · Recepta Orbit",
};

export default async function SimuladorPage() {
  const seed = await getSimulatorSeed();

  return (
    <div className="space-y-6">
      <header className="animate-fade-in">
        <h1 className="font-display text-display-lg font-bold tracking-tight text-ink">
          Simulador de crescimento
        </h1>
        <p className="mt-1 max-w-2xl text-body text-secondary">
          Ajuste os controles e veja leads, vendas e faturamento projetados a partir dos
          dados reais da sua farmácia.
        </p>
      </header>

      <SimulatorPanel seed={seed} />
    </div>
  );
}
