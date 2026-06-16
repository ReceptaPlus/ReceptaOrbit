import type { ConversationCycle, Message } from "@/types/domain";

/* 8 ciclos. SEM classificação inline (vive em analyses.mock). expiresAt = startedAt+24h.
   Cenários: OPEN · WAITING_PHARMACY · CLOSED com venda · CLOSED sem venda (LOST)
   · needsReview=true (cyc_005, análise IA baixa vs threshold) · ciclo do tenant B (cyc_008). */
export const conversationCycles: ConversationCycle[] = [
  { id: "cyc_001", pharmacyId: "pha_dsp", contactId: "cnt_maria", startedAt: "2026-06-10T14:42:00Z", expiresAt: "2026-06-11T14:42:00Z", lastMessageAt: "2026-06-10T14:51:00Z", status: "CLOSED", attribution: { source: "META_ADS", method: "PROVIDER_REFERRAL", confidence: 0.97, campaignName: "Genéricos Junho" }, saleId: "sal_1041" },
  { id: "cyc_002", pharmacyId: "pha_dsp", contactId: "cnt_joao", startedAt: "2026-06-10T13:10:00Z", expiresAt: "2026-06-11T13:10:00Z", lastMessageAt: "2026-06-10T13:22:00Z", status: "WAITING_PHARMACY", attribution: { source: "GOOGLE_ADS", method: "CLICK_IDENTIFIER", confidence: 0.88, campaignName: "Vitaminas Search", trackingLinkId: "trk_002" } },
  { id: "cyc_003", pharmacyId: "pha_dsp", contactId: "cnt_ana", startedAt: "2026-06-10T10:55:00Z", expiresAt: "2026-06-11T10:55:00Z", lastMessageAt: "2026-06-10T11:20:00Z", status: "CLOSED", attribution: { source: "INSTAGRAM_ORGANIC", method: "AI_INFERENCE", confidence: 0.62 }, saleId: "sal_1039" },
  { id: "cyc_004", pharmacyId: "pha_dsp", contactId: "cnt_rafael", startedAt: "2026-06-10T09:48:00Z", expiresAt: "2026-06-11T09:48:00Z", lastMessageAt: "2026-06-10T10:07:00Z", status: "CLOSED", attribution: { source: "META_ADS", method: "TRACKING_TOKEN", confidence: 0.95, campaignName: "Remarketing Maio", trackingLinkId: "trk_003" }, saleId: "sal_1040" },
  { id: "cyc_005", pharmacyId: "pha_dsp", contactId: "cnt_beatriz", startedAt: "2026-06-15T09:45:00Z", expiresAt: "2026-06-16T09:45:00Z", lastMessageAt: "2026-06-15T09:45:00Z", status: "OPEN", attribution: { source: "UNKNOWN", method: "AI_INFERENCE", confidence: 0.3 } },
  { id: "cyc_006", pharmacyId: "pha_dsp", contactId: "cnt_carlos", startedAt: "2026-06-12T08:20:00Z", expiresAt: "2026-06-13T08:20:00Z", lastMessageAt: "2026-06-12T08:30:00Z", status: "CLOSED", attribution: { source: "GOOGLE_ADS", method: "UTM", confidence: 0.81, campaignName: "Marca Institucional" }, saleId: "sal_1038" },
  { id: "cyc_007", pharmacyId: "pha_dsp", contactId: "cnt_fernanda", startedAt: "2026-06-09T14:00:00Z", expiresAt: "2026-06-10T14:00:00Z", lastMessageAt: "2026-06-09T14:15:00Z", status: "CLOSED", attribution: { source: "DIRECT", method: "MANUAL", confidence: 1.0 } },
  // Tenant B — isolamento: jamais listado ao navegar como pha_dsp:
  { id: "cyc_008", pharmacyId: "pha_vida", contactId: "cnt_outro", startedAt: "2026-06-14T17:40:00Z", expiresAt: "2026-06-15T17:40:00Z", lastMessageAt: "2026-06-14T18:00:00Z", status: "CLOSED", attribution: { source: "WHATSAPP_ORGANIC", method: "MANUAL", confidence: 1.0 } },
];

/* Mensagens — espelho imutável; pharmacyId herdado do ciclo. */
export const messages: Message[] = [
  // cyc_001
  { id: "msg_0101", cycleId: "cyc_001", pharmacyId: "pha_dsp", direction: "INBOUND", textContent: "Boa tarde! Gostaria de saber sobre dipirona 500mg.", sentAt: "2026-06-10T14:42:00Z" },
  { id: "msg_0102", cycleId: "cyc_001", pharmacyId: "pha_dsp", direction: "OUTBOUND", textContent: "Olá Maria! Temos em estoque. Caixa com 10 comprimidos por R$ 12,90. Deseja encomendar?", sentAt: "2026-06-10T14:43:00Z" },
  { id: "msg_0103", cycleId: "cyc_001", pharmacyId: "pha_dsp", direction: "INBOUND", textContent: "Sim, quero 3 caixas. Entrega disponível?", sentAt: "2026-06-10T14:45:00Z" },
  { id: "msg_0104", cycleId: "cyc_001", pharmacyId: "pha_dsp", direction: "OUTBOUND", textContent: "Sim! Entregamos em até 2h. Pedido confirmado, total R$ 89,00 via PIX.", sentAt: "2026-06-10T14:51:00Z" },
  // cyc_002
  { id: "msg_0201", cycleId: "cyc_002", pharmacyId: "pha_dsp", direction: "INBOUND", textContent: "Olá, preciso de orçamento para vitamina D 2000UI e Ômega 3.", sentAt: "2026-06-10T13:10:00Z" },
  { id: "msg_0202", cycleId: "cyc_002", pharmacyId: "pha_dsp", direction: "OUTBOUND", textContent: "Olá João! Vitamina D 2000UI: R$ 32,90. Ômega 3: R$ 45,00.", sentAt: "2026-06-10T13:15:00Z" },
  { id: "msg_0203", cycleId: "cyc_002", pharmacyId: "pha_dsp", direction: "INBOUND", textContent: "E a vitamina C, quanto fica?", sentAt: "2026-06-10T13:22:00Z" },
  // cyc_003
  { id: "msg_0301", cycleId: "cyc_003", pharmacyId: "pha_dsp", direction: "INBOUND", textContent: "Oi! Vi no Instagram sobre o colágeno. Vocês têm?", sentAt: "2026-06-10T10:55:00Z" },
  { id: "msg_0302", cycleId: "cyc_003", pharmacyId: "pha_dsp", direction: "OUTBOUND", textContent: "Oi Ana! Sim, Colágeno Verisol em pó. R$ 48,00 / 150g.", sentAt: "2026-06-10T10:58:00Z" },
  { id: "msg_0303", cycleId: "cyc_003", pharmacyId: "pha_dsp", direction: "INBOUND", textContent: "Vou querer! PIX mesmo. Pedido entregue, obrigada!", sentAt: "2026-06-10T11:20:00Z" },
  // cyc_004
  { id: "msg_0401", cycleId: "cyc_004", pharmacyId: "pha_dsp", direction: "INBOUND", textContent: "Bom dia! Preciso de omeprazol 20mg e loratadina 10mg.", sentAt: "2026-06-10T09:48:00Z" },
  { id: "msg_0402", cycleId: "cyc_004", pharmacyId: "pha_dsp", direction: "OUTBOUND", textContent: "Bom dia Rafael! Separo 4 caixas de cada: R$ 125,60 + entrega R$ 9,90 = R$ 145,00.", sentAt: "2026-06-10T10:05:00Z" },
  { id: "msg_0403", cycleId: "cyc_004", pharmacyId: "pha_dsp", direction: "INBOUND", textContent: "Perfeito, muito obrigado!", sentAt: "2026-06-10T10:07:00Z" },
  // cyc_005 (OPEN, novo)
  { id: "msg_0501", cycleId: "cyc_005", pharmacyId: "pha_dsp", direction: "INBOUND", textContent: "Olá, vocês têm algum manipulado para insônia? Gostaria de saber os valores.", sentAt: "2026-06-15T09:45:00Z" },
  // cyc_006 (corrigido por humano)
  { id: "msg_0601", cycleId: "cyc_006", pharmacyId: "pha_dsp", direction: "INBOUND", textContent: "Preciso de antibiótico com receita, posso levar pessoalmente?", sentAt: "2026-06-12T08:20:00Z" },
  { id: "msg_0602", cycleId: "cyc_006", pharmacyId: "pha_dsp", direction: "OUTBOUND", textContent: "Claro Carlos! Estamos abertos das 8h às 22h.", sentAt: "2026-06-12T08:25:00Z" },
  { id: "msg_0603", cycleId: "cyc_006", pharmacyId: "pha_dsp", direction: "INBOUND", textContent: "Combinado. Até logo!", sentAt: "2026-06-12T08:30:00Z" },
  // cyc_007 (LOST)
  { id: "msg_0701", cycleId: "cyc_007", pharmacyId: "pha_dsp", direction: "INBOUND", textContent: "Quanto está a loratadina?", sentAt: "2026-06-09T14:00:00Z" },
  { id: "msg_0702", cycleId: "cyc_007", pharmacyId: "pha_dsp", direction: "OUTBOUND", textContent: "R$ 12,90 a caixa com 10 comprimidos.", sentAt: "2026-06-09T14:05:00Z" },
  { id: "msg_0703", cycleId: "cyc_007", pharmacyId: "pha_dsp", direction: "INBOUND", textContent: "Achei caro, vou pesquisar. Obrigada.", sentAt: "2026-06-09T14:15:00Z" },
  // cyc_008 (tenant B)
  { id: "msg_0801", cycleId: "cyc_008", pharmacyId: "pha_vida", direction: "INBOUND", textContent: "Bom dia, vocês entregam no centro?", sentAt: "2026-06-14T17:40:00Z" },
  { id: "msg_0802", cycleId: "cyc_008", pharmacyId: "pha_vida", direction: "OUTBOUND", textContent: "Bom dia Joana! Sim, entrega grátis acima de R$ 50.", sentAt: "2026-06-14T18:00:00Z" },
];
