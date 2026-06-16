import { z } from "zod";

export const confirmSaleSchema = z.object({
  saleId: z.string(),
  netAmountCents: z.number().int().min(1, "Valor deve ser maior que zero"),
});

export const rejectSaleSchema = z.object({
  saleId: z.string(),
  reason: z.enum(["NOT_A_SALE", "DUPLICATE", "WRONG_VALUE", "OTHER"]),
  note: z.string().optional(),
});

export type ConfirmSaleInput = z.infer<typeof confirmSaleSchema>;
export type RejectSaleInput = z.infer<typeof rejectSaleSchema>;
