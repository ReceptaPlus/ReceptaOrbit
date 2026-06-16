import type { Contact } from "@/types/domain";

/* 9 contatos. 8 em pha_dsp + 1 em pha_vida (cnt_outro) p/ verificar isolamento
   de tenant. Cenários: recorrente (rafael 7 compras) · novo sem compra (beatriz)
   · só-orçamento (joao) · de outra farmácia (cnt_outro).
   totalSpent/purchaseCount/conversationCount são projeções (ro). */
export const contacts: Contact[] = [
  { id: "cnt_maria", pharmacyId: "pha_dsp", name: "Maria Silva", phoneE164: "+5511990003421", firstSeenAt: "2026-03-12T10:00:00Z", lastSeenAt: "2026-06-10T14:51:00Z", conversationCount: 5, purchaseCount: 3, totalSpent: { amountCents: 18400, currency: "BRL" }, recurrentSources: ["META_ADS"] },
  { id: "cnt_joao", pharmacyId: "pha_dsp", name: "João Pereira", phoneE164: "+5511990007832", firstSeenAt: "2026-06-10T13:10:00Z", lastSeenAt: "2026-06-10T13:22:00Z", conversationCount: 2, purchaseCount: 0, totalSpent: { amountCents: 0, currency: "BRL" }, recurrentSources: ["GOOGLE_ADS"] },
  { id: "cnt_ana", pharmacyId: "pha_dsp", name: "Ana Costa", phoneE164: "+5521990001234", firstSeenAt: "2026-06-10T10:55:00Z", lastSeenAt: "2026-06-10T11:20:00Z", conversationCount: 3, purchaseCount: 1, totalSpent: { amountCents: 4800, currency: "BRL" }, recurrentSources: ["INSTAGRAM_ORGANIC"] },
  { id: "cnt_rafael", pharmacyId: "pha_dsp", name: "Rafael Lima", phoneE164: "+5511990005543", firstSeenAt: "2025-11-20T10:00:00Z", lastSeenAt: "2026-06-10T10:07:00Z", conversationCount: 12, purchaseCount: 7, totalSpent: { amountCents: 52100, currency: "BRL" }, recurrentSources: ["META_ADS"], notes: "Cliente recorrente, prefere entrega." },
  { id: "cnt_carlos", pharmacyId: "pha_dsp", name: "Carlos Andrade", phoneE164: "+5511990002211", firstSeenAt: "2026-01-15T08:00:00Z", lastSeenAt: "2026-06-12T08:30:00Z", conversationCount: 6, purchaseCount: 4, totalSpent: { amountCents: 38000, currency: "BRL" }, recurrentSources: ["GOOGLE_ADS"] },
  { id: "cnt_pedro", pharmacyId: "pha_dsp", name: "Pedro Santos", phoneE164: "+5511990006678", firstSeenAt: "2026-02-08T16:00:00Z", lastSeenAt: "2026-06-09T16:20:00Z", conversationCount: 8, purchaseCount: 5, totalSpent: { amountCents: 29000, currency: "BRL" }, recurrentSources: ["GOOGLE_ADS"] },
  { id: "cnt_fernanda", pharmacyId: "pha_dsp", name: "Fernanda Lima", phoneE164: "+5511990004430", firstSeenAt: "2026-06-08T14:00:00Z", lastSeenAt: "2026-06-09T14:15:00Z", conversationCount: 1, purchaseCount: 0, totalSpent: { amountCents: 0, currency: "BRL" }, recurrentSources: ["DIRECT"] },
  { id: "cnt_beatriz", pharmacyId: "pha_dsp", name: "Beatriz Souza", phoneE164: "+5511990009981", firstSeenAt: "2026-06-15T09:45:00Z", lastSeenAt: "2026-06-15T09:45:00Z", conversationCount: 1, purchaseCount: 0, totalSpent: { amountCents: 0, currency: "BRL" }, recurrentSources: ["UNKNOWN"] },
  // Tenant B — NUNCA deve aparecer ao navegar como pha_dsp:
  { id: "cnt_outro", pharmacyId: "pha_vida", name: "Joana Mendes", phoneE164: "+5511980001122", firstSeenAt: "2026-05-01T10:00:00Z", lastSeenAt: "2026-06-14T18:00:00Z", conversationCount: 4, purchaseCount: 2, totalSpent: { amountCents: 9800, currency: "BRL" }, recurrentSources: ["WHATSAPP_ORGANIC"] },
];
