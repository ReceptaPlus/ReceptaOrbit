import { z } from "zod";

export const correctionSchema = z.object({
  stage: z.enum([
    "NEW",
    "IN_SERVICE",
    "NEEDS_IDENTIFIED",
    "QUOTE_SENT",
    "NEGOTIATION",
    "SALE_CONFIRMED",
    "LOST",
    "UNCLASSIFIED",
  ]),
  outcome: z.enum(["SALE", "NO_SALE", "ABANDONED", "SPAM", "SUPPORT", "UNKNOWN"]),
  estimatedValueCents: z.number().int().min(0).nullable(),
  reason: z.string().min(5, "Descreva o motivo da correção"),
});

export type CorrectionInput = z.infer<typeof correctionSchema>;
