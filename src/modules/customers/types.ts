import type { AttributionSource } from "@/modules/conversations/types";

export interface Contact {
  id: string;
  name: string;
  phoneE164: string;
  phoneMasked: string;
  firstSeenAt: string;
  lastSeenAt: string;
  conversationCount: number;
  purchaseCount: number;
  totalSpentCents: number;
  recurrentSources: AttributionSource[];
  notes?: string;
}
