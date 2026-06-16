export type Stage =
  | "NEW"
  | "IN_SERVICE"
  | "NEEDS_IDENTIFIED"
  | "QUOTE_SENT"
  | "NEGOTIATION"
  | "SALE_CONFIRMED"
  | "LOST"
  | "UNCLASSIFIED";

export type CycleStatus =
  | "OPEN"
  | "WAITING_CUSTOMER"
  | "WAITING_PHARMACY"
  | "CLOSED"
  | "ARCHIVED";

export type Outcome = "SALE" | "NO_SALE" | "ABANDONED" | "SPAM" | "SUPPORT" | "UNKNOWN";

export type AttributionSource =
  | "META_ADS"
  | "GOOGLE_ADS"
  | "INSTAGRAM_ORGANIC"
  | "FACEBOOK_ORGANIC"
  | "WHATSAPP_ORGANIC"
  | "DIRECT"
  | "REFERRAL"
  | "UNKNOWN";

export type AttributionMethod =
  | "PROVIDER_REFERRAL"
  | "TRACKING_TOKEN"
  | "CLICK_IDENTIFIER"
  | "UTM"
  | "MANUAL"
  | "AI_INFERENCE";

export interface Message {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  textContent: string;
  sentAt: string;
}

export interface Attribution {
  source: AttributionSource;
  method: AttributionMethod;
  confidence: number;
  campaignName?: string;
}

export interface ConversationCycle {
  id: string;
  contactId: string;
  contactName: string;
  phone: string;
  startedAt: string;
  lastMessageAt: string;
  status: CycleStatus;
  stage: Stage;
  outcome: Outcome;
  estimatedValueCents: number | null;
  needsReview: boolean;
  attribution: Attribution;
  aiSummary: string;
  aiConfidence: number;
  messages: Message[];
}
