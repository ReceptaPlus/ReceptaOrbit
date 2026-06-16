import type { AttributionSource } from "@/modules/conversations/types";

export type SaleStatus = "PENDING_REVIEW" | "CONFIRMED" | "CANCELLED" | "REFUNDED";
export type IdentificationSource = "AI" | "MANUAL" | "INTEGRATION";

export interface SaleItem {
  productName: string;
  rawProductName: string;
  quantity: number;
  unitPriceCents: number;
  totalPriceCents: number;
}

export interface Sale {
  id: string;
  contactId: string;
  contactName: string;
  conversationCycleId: string;
  netAmountCents: number;
  status: SaleStatus;
  identificationSource: IdentificationSource;
  confidence: number;
  soldAt: string;
  attributionSource: AttributionSource;
  campaignName?: string;
  items: SaleItem[];
}
