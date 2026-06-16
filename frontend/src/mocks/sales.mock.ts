import type { Sale } from "@/types/domain";

const brl = (amountCents: number) => ({ amountCents, currency: "BRL" as const });

/* 6 vendas (todas pha_dsp). Cenários: PENDING_REVIEW (fila) · CONFIRMED por IA
   · CONFIRMED por correção · REFUNDED · MANUAL com conversationCycleId: null.
   attribution = VO copiado do ciclo no momento (manual = DIRECT/MANUAL). */
export const sales: Sale[] = [
  { id: "sal_1041", pharmacyId: "pha_dsp", contactId: "cnt_maria", conversationCycleId: "cyc_001", amount: brl(8900), status: "CONFIRMED", identificationSource: "AI", confidence: 0.91, attribution: { source: "META_ADS", method: "PROVIDER_REFERRAL", confidence: 0.97, campaignName: "Genéricos Junho" }, soldAt: "2026-06-10T14:51:00Z", items: [{ rawName: "dipirona 500", normalizedName: "Dipirona 500mg", quantity: 3, unitPrice: brl(1290), totalPrice: brl(3870) }] },
  { id: "sal_1040", pharmacyId: "pha_dsp", contactId: "cnt_rafael", conversationCycleId: "cyc_004", amount: brl(14500), status: "CONFIRMED", identificationSource: "AI", confidence: 0.93, attribution: { source: "META_ADS", method: "TRACKING_TOKEN", confidence: 0.95, campaignName: "Remarketing Maio", trackingLinkId: "trk_003" }, soldAt: "2026-06-10T10:07:00Z", items: [{ rawName: "omeprazol", normalizedName: "Omeprazol 20mg", quantity: 4, unitPrice: brl(1850), totalPrice: brl(7400) }, { rawName: "loratadina", normalizedName: "Loratadina 10mg", quantity: 4, unitPrice: brl(1290), totalPrice: brl(5160) }] },
  // CONFIRMED após correção humana (ver audit aud_002 + aud_003):
  { id: "sal_1039", pharmacyId: "pha_dsp", contactId: "cnt_ana", conversationCycleId: "cyc_003", amount: brl(4800), status: "CONFIRMED", identificationSource: "AI", confidence: 0.62, attribution: { source: "INSTAGRAM_ORGANIC", method: "AI_INFERENCE", confidence: 0.62 }, soldAt: "2026-06-10T11:20:00Z", items: [{ rawName: "colageno verisol po", normalizedName: "Colágeno Verisol", quantity: 1, unitPrice: brl(4800), totalPrice: brl(4800) }] },
  // PENDING_REVIEW — alimenta a fila de revisão:
  { id: "sal_1038", pharmacyId: "pha_dsp", contactId: "cnt_carlos", conversationCycleId: "cyc_006", amount: brl(18900), status: "PENDING_REVIEW", identificationSource: "AI", confidence: 0.55, attribution: { source: "GOOGLE_ADS", method: "UTM", confidence: 0.81, campaignName: "Marca Institucional" }, soldAt: "2026-06-12T08:30:00Z", items: [{ rawName: "antibiotico receita", normalizedName: "Manipulado (antibiótico)", quantity: 1, unitPrice: brl(18900), totalPrice: brl(18900) }] },
  // MANUAL sem ciclo (conversationCycleId: null — nunca id sentinela):
  { id: "sal_1037", pharmacyId: "pha_dsp", contactId: "cnt_pedro", conversationCycleId: null, amount: brl(4500), status: "CONFIRMED", identificationSource: "MANUAL", confidence: 1.0, attribution: { source: "DIRECT", method: "MANUAL", confidence: 1.0 }, soldAt: "2026-06-09T17:30:00Z", items: [{ rawName: "omega 3 60caps", normalizedName: "Ômega 3", quantity: 1, unitPrice: brl(4500), totalPrice: brl(4500) }] },
  // REFUNDED:
  { id: "sal_1036", pharmacyId: "pha_dsp", contactId: "cnt_pedro", conversationCycleId: null, amount: brl(3290), status: "REFUNDED", identificationSource: "MANUAL", confidence: 1.0, attribution: { source: "WHATSAPP_ORGANIC", method: "MANUAL", confidence: 1.0 }, soldAt: "2026-06-08T11:30:00Z", items: [{ rawName: "vitamina d", normalizedName: "Vitamina D 2000UI", quantity: 1, unitPrice: brl(3290), totalPrice: brl(3290) }] },
];
