import { z } from "zod";

/* Contratos dos payloads que o n8n devolve. Validados na BORDA (endpoint) antes de
   tocar o banco — o app continua dono do contrato mesmo com a IA rodando fora.
   Datas aceitam ISO string e são coeridas para Date. */

// Resultado da IA para um ciclo. analyzedThroughMessageAt = até qual ponto da conversa
// a análise vale (gate de idempotência/re-análise no banco).
export const cycleResultSchema = z.object({
  cycleId: z.uuid(),
  pharmacyId: z.uuid(),
  isSale: z.boolean(),
  saleValueCents: z.number().int().nonnegative().nullable().optional(),
  stage: z.string().max(120).nullable().optional(),
  lossReason: z.string().max(500).nullable().optional(),
  summary: z.string().min(1).max(4000),
  confidence: z.number().min(0).max(1),
  model: z.string().min(1).max(120),
  analyzedThroughMessageAt: z.coerce.date(),
});

// O n8n manda um lote (limita custo/uma chamada por tick). max 100 por POST.
export const cycleResultsBodySchema = z.object({
  results: z.array(cycleResultSchema).min(1).max(100),
});

// Relatório agregado pro dono. Métricas vêm calculadas pelo site (GET report/pending);
// o n8n só escreve a narrativa e devolve o snapshot junto (evita recomputar fora).
export const reportBodySchema = z.object({
  pharmacyId: z.uuid(),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  narrative: z.string().min(1).max(4000),
  salesCount: z.number().int().nonnegative(),
  salesValueCents: z.number().int().nonnegative(),
  conversationCount: z.number().int().nonnegative(),
  conversionRate: z.number().min(0).max(1),
  model: z.string().min(1).max(120),
});

export type CycleResult = z.infer<typeof cycleResultSchema>;
export type CycleResultsBody = z.infer<typeof cycleResultsBodySchema>;
export type ReportBody = z.infer<typeof reportBodySchema>;
