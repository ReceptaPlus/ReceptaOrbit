import "server-only";
import { db } from "@/server/db";
import { getAuthorizedPharmacyContext } from "@/server/auth/dal";
import { getAdsCardsVM } from "@/modules/dashboard/queries";
import { SIMULATOR_DEFAULTS } from "@/lib/constants";
import type { SimulatorInputs, SimulatorSeed } from "./types";

/* Seed do Simulador — ponto de partida REAL da farmácia.
   · CPL / investimento → banco central (Agente-Meta-Ads): spend / conversions.
   · Conversão / ticket → agregado direto das análises da IA (CycleAnalysis); SalesReport
     é fallback; default só se a IA ainda não analisou nenhuma conversa.
   · Retenção → proxy de recompra (compradores com venda em ≥2 meses); default se amostra rasa.
   · Município/UF → da PRÓPRIA farmácia (Pharmacy.city/uf, informado na criação).
   Sem dado → cai nos SIMULATOR_DEFAULTS (segue utilizável como calculadora manual). */

const MONTH_DAYS = 30; // janela ~mensal p/ o seed
const MIN_RETENTION_SAMPLE = 10; // abaixo disso o proxy de retenção é ruído → usa default

const round2 = (n: number) => Math.round(n * 100) / 100;

export async function getSimulatorSeed(): Promise<SimulatorSeed> {
  const { pharmacyId } = await getAuthorizedPharmacyContext();

  const [ads, report, saleAnalyses, totalAnalyses, conversationsCount, pharmacy] = await Promise.all([
    getAdsCardsVM(MONTH_DAYS), // AdsSummary | null (spend/conversions ~30d, Meta+Google)
    db.salesReport.findFirst({
      where: { pharmacyId },
      orderBy: { generatedAt: "desc" },
      select: { salesCount: true, salesValueCents: true, conversionRate: true },
    }),
    // Vendas analisadas: ticket real + retenção. Escala pequena na V1; agregação em JS.
    db.cycleAnalysis.findMany({
      where: { pharmacyId, isSale: true },
      select: { saleValueCents: true, cycle: { select: { contactId: true } } },
    }),
    db.cycleAnalysis.count({ where: { pharmacyId } }), // a IA já analisou algo?
    db.conversationCycle.count({ where: { pharmacyId } }), // denominador da conversão
    db.pharmacy.findUnique({ where: { id: pharmacyId }, select: { city: true, uf: true } }),
  ]);

  // ── CPL + investimento (banco central) ──
  const hasAds = ads !== null;
  const spend = ads ? ads.meta.spend + ads.google.spend : 0;
  const conversions = ads ? ads.meta.conversions + ads.google.conversions : 0;
  const cpl = conversions > 0 ? spend / conversions : SIMULATOR_DEFAULTS.cpl;
  const monthlyInvestment = spend > 0 ? spend : SIMULATOR_DEFAULTS.monthlyInvestment;

  // ── Conversão + ticket: agregado REAL das análises da IA → SalesReport → default ──
  const salesCount = saleAnalyses.length;
  const valued = saleAnalyses.filter((a) => a.saleValueCents != null);
  const ticketFromAnalyses =
    valued.length > 0 ? valued.reduce((s, a) => s + (a.saleValueCents ?? 0), 0) / 100 / valued.length : null;
  const ticketFromReport = report && report.salesCount > 0 ? report.salesValueCents / 100 / report.salesCount : null;

  let conversionRate: number;
  let ticket: number;
  let hasConversionData: boolean;
  if (totalAnalyses > 0) {
    // Real: a IA já analisou conversas. Mais fresco que o snapshot do SalesReport.
    conversionRate = conversationsCount > 0 ? salesCount / conversationsCount : 0;
    ticket = ticketFromAnalyses ?? ticketFromReport ?? SIMULATOR_DEFAULTS.ticket;
    hasConversionData = true;
  } else if (report) {
    conversionRate = report.conversionRate;
    ticket = ticketFromReport ?? SIMULATOR_DEFAULTS.ticket;
    hasConversionData = true;
  } else {
    conversionRate = SIMULATOR_DEFAULTS.conversionRate;
    ticket = SIMULATOR_DEFAULTS.ticket;
    hasConversionData = false;
  }

  // ── Retenção (proxy): recompra = compradores com ≥2 vendas / total de compradores.
  //    Conta vendas por contato (não o mês da análise) — robusto a análise em lote. ──
  const salesByContact = new Map<string, number>();
  for (const a of saleAnalyses) {
    const cid = a.cycle.contactId;
    salesByContact.set(cid, (salesByContact.get(cid) ?? 0) + 1);
  }
  const buyersSample = salesByContact.size;
  const repeatBuyers = Array.from(salesByContact.values()).filter((n) => n >= 2).length;
  const retentionIsProxy = buyersSample >= MIN_RETENTION_SAMPLE;
  const retentionRate = retentionIsProxy ? repeatBuyers / buyersSample : SIMULATOR_DEFAULTS.retentionRate;

  const inputs: SimulatorInputs = {
    monthlyInvestment: round2(monthlyInvestment),
    cpl: round2(cpl),
    conversionRate,
    ticket: round2(ticket),
    retentionRate,
  };

  return {
    hasAds,
    hasConversionData,
    periodDays: MONTH_DAYS,
    adConversions: conversions,
    inputs,
    retentionIsProxy,
    buyersSample,
    city: pharmacy?.city ?? null,
    uf: pharmacy?.uf ?? null,
  };
}
