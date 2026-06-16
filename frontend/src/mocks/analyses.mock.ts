import type { AIAnalysis } from "@/types/domain";

/* 10 análises versionadas (append-only). "Vigente" = maior version não-superada.
   Cenários: IA alta confiança (cyc_001/004) · IA baixa → needsReview (cyc_005)
   · v1 IA + v2 correção humana com supersededById (cyc_003 e cyc_006). */
export const analyses: AIAnalysis[] = [
  { id: "ana_001", cycleId: "cyc_001", version: 1, actor: { type: "AI", model: "claude-haiku" }, stage: "SALE_CONFIRMED", outcome: "SALE", estimatedValue: { amountCents: 8900, currency: "BRL" }, confidence: 0.91, summary: "Cliente comprou 3 caixas de dipirona 500mg com entrega. PIX confirmado.", createdAt: "2026-06-10T14:52:00Z" },
  { id: "ana_002", cycleId: "cyc_002", version: 1, actor: { type: "AI", model: "claude-haiku" }, stage: "QUOTE_SENT", outcome: "UNKNOWN", estimatedValue: { amountCents: 12290, currency: "BRL" }, confidence: 0.74, summary: "Orçamento parcial de vitaminas enviado; aguarda resposta sobre vitamina C.", createdAt: "2026-06-10T13:23:00Z" },
  // cyc_003 — IA baixa superada por correção humana (venda confirmada por correção):
  { id: "ana_003a", cycleId: "cyc_003", version: 1, actor: { type: "AI", model: "claude-haiku" }, stage: "SALE_CONFIRMED", outcome: "SALE", estimatedValue: { amountCents: 4800, currency: "BRL" }, confidence: 0.62, summary: "Cliente veio pelo Instagram, comprou colágeno Verisol via PIX.", createdAt: "2026-06-10T11:21:00Z", supersededById: "ana_003b" },
  { id: "ana_003b", cycleId: "cyc_003", version: 2, actor: { type: "USER", userId: "usr_camila" }, stage: "SALE_CONFIRMED", outcome: "SALE", estimatedValue: { amountCents: 4800, currency: "BRL" }, confidence: 1.0, summary: "Venda de Colágeno Verisol confirmada.", correctionReason: "Origem confirmada como Instagram orgânico pelo cliente.", createdAt: "2026-06-10T12:00:00Z" },
  { id: "ana_004", cycleId: "cyc_004", version: 1, actor: { type: "AI", model: "claude-haiku" }, stage: "SALE_CONFIRMED", outcome: "SALE", estimatedValue: { amountCents: 14500, currency: "BRL" }, confidence: 0.93, summary: "Cliente recorrente comprou 4 caixas de omeprazol e 4 de loratadina com entrega.", createdAt: "2026-06-10T10:08:00Z" },
  // cyc_005 — IA baixa, sem correção → needsReview (0.30 < threshold 0.85):
  { id: "ana_005", cycleId: "cyc_005", version: 1, actor: { type: "AI", model: "claude-haiku" }, stage: "NEW", outcome: "UNKNOWN", estimatedValue: null, confidence: 0.3, summary: "Cliente perguntou sobre manipulado para insônia. Sem resposta da farmácia.", createdAt: "2026-06-15T09:46:00Z" },
  // cyc_006 — exemplo canônico: v1 IA 0.55 superada por v2 humana 1.0:
  { id: "ana_006a", cycleId: "cyc_006", version: 1, actor: { type: "AI", model: "claude-haiku" }, stage: "SALE_CONFIRMED", outcome: "SALE", estimatedValue: { amountCents: 21000, currency: "BRL" }, confidence: 0.55, summary: "Venda presencial estimada de antibiótico com receita.", createdAt: "2026-06-12T08:31:00Z", supersededById: "ana_006b" },
  { id: "ana_006b", cycleId: "cyc_006", version: 2, actor: { type: "USER", userId: "usr_antonio" }, stage: "SALE_CONFIRMED", outcome: "SALE", estimatedValue: { amountCents: 18900, currency: "BRL" }, confidence: 1.0, summary: "Venda presencial confirmada no balcão.", correctionReason: "Valor real do cupom fiscal.", createdAt: "2026-06-12T11:00:00Z" },
  { id: "ana_007", cycleId: "cyc_007", version: 1, actor: { type: "AI", model: "claude-haiku" }, stage: "LOST", outcome: "NO_SALE", estimatedValue: { amountCents: 1290, currency: "BRL" }, confidence: 0.87, summary: "Cliente achou o preço da loratadina alto e não fechou. Motivo: preço.", createdAt: "2026-06-09T14:16:00Z" },
  // cyc_008 — tenant B:
  { id: "ana_008", cycleId: "cyc_008", version: 1, actor: { type: "AI", model: "claude-haiku" }, stage: "IN_SERVICE", outcome: "UNKNOWN", estimatedValue: null, confidence: 0.8, summary: "Cliente perguntou sobre área de entrega.", createdAt: "2026-06-14T18:01:00Z" },
];
