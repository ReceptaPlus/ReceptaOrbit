/* ==========================================================================
   Recepta Orbit — Contratos de Domínio (CONGELADOS)
   Fonte única da verdade: docs/CONTRATOS-FRONTEND.md (Parte 1) + DOMAIN-MODEL.md.
   Toda tela/mock/selector tipa POR AQUI. Campos proibidos (Parte 7) não voltam:
   - classificação inline no ciclo (vive em AIAnalysis)
   - user.pharmacyId (vive em Membership)
   - dinheiro float (Money em centavos)
   - conversationCycleId sentinela "c-000" (é null)
   - role RECEPTA_ADMIN em TenantRole (papel de plataforma vive em PlatformStaff)
   ========================================================================== */

/* ── Value Objects ──────────────────────────────────────────────────────── */

export type Money = { amountCents: number; currency: "BRL" }; // ≥ 0, nunca float

export type ActorRef =
  | { type: "USER"; userId: string; onBehalfOf?: string } // onBehalfOf = pharmacyId (staff)
  | { type: "AI"; model: string }
  | { type: "SYSTEM" };

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

export interface Attribution {
  source: AttributionSource;
  method: AttributionMethod;
  confidence: number;
  campaignName?: string;
  trackingLinkId?: string; // ref por id, nunca objeto
}

/* ── Identity & Access ──────────────────────────────────────────────────── */

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  // initials: DERIVADO via initials(name) — nunca armazenado
}

export type TenantRole = "OWNER" | "MANAGER" | "VIEWER";
export type MembershipStatus = "INVITED" | "ACTIVE" | "SUSPENDED";

export interface Membership {
  id: string;
  userId: string;
  pharmacyId: string;
  role: TenantRole;
  status: MembershipStatus;
  invitedByUserId?: string;
  inviteExpiresAt?: string; // só INVITED
  lastAccessAt?: string;
}

export type PlatformRole = "PLATFORM_ADMIN" | "PLATFORM_SUPPORT";

export interface PlatformStaff {
  userId: string;
  role: PlatformRole;
}

/* ── Tenancy ────────────────────────────────────────────────────────────── */

export type PharmacyStatus = "ACTIVE" | "SUSPENDED";

export interface Pharmacy {
  id: string;
  tradeName: string;
  legalName: string;
  cnpj: string; // 00.000.000/0000-00
  timezone: string; // default America/Sao_Paulo
  plan: "START" | "PRO";
  status: PharmacyStatus;
  aiSettings: {
    autoConfirmThreshold: number; // 0.5–0.95 · default 0.85
    summaryLanguage: "pt-BR";
  };
}

export type WhatsAppState = "DISCONNECTED" | "PAIRING" | "CONNECTED" | "DOWN";

export interface WhatsAppConnection {
  pharmacyId: string; // 1:1 com Pharmacy
  state: WhatsAppState;
  pairedNumber?: string; // CONNECTED/DOWN
  instanceName?: string;
  stateChangedAt: string; // "caído desde X"
  qrExpiresAt?: string; // PAIRING
}

/* ── Contacts (CRM) ─────────────────────────────────────────────────────── */

export interface Contact {
  id: string;
  pharmacyId: string;
  name: string; // fallback: telefone
  phoneE164: string; // UNIQUE por tenant · mascarado p/ VIEWER (regra de exibição)
  firstSeenAt: string;
  lastSeenAt: string;
  notes?: string;
  // DERIVADOS (projeções — UI nunca escreve):
  conversationCount: number;
  purchaseCount: number;
  totalSpent: Money;
  recurrentSources: AttributionSource[];
}

/* ── Conversations ──────────────────────────────────────────────────────── */

export type CycleStatus =
  | "OPEN"
  | "WAITING_CUSTOMER"
  | "WAITING_PHARMACY"
  | "CLOSED"
  | "ARCHIVED";

export interface ConversationCycle {
  id: string;
  pharmacyId: string;
  contactId: string;
  startedAt: string;
  expiresAt: string; // startedAt + 24h
  lastMessageAt: string;
  status: CycleStatus;
  attribution: Attribution; // VO-snapshot
  saleId?: string;
  // currentAnalysis e needsReview são DERIVADOS (via getCurrentAnalysis); nunca campos.
}

export interface Message {
  id: string;
  cycleId: string;
  pharmacyId: string; // herdado do ciclo
  direction: "INBOUND" | "OUTBOUND";
  textContent: string; // IMUTÁVEL
  sentAt: string;
}

export type Stage =
  | "NEW"
  | "IN_SERVICE"
  | "NEEDS_IDENTIFIED"
  | "QUOTE_SENT"
  | "NEGOTIATION"
  | "SALE_CONFIRMED"
  | "LOST"
  | "UNCLASSIFIED";

export type Outcome = "SALE" | "NO_SALE" | "ABANDONED" | "SPAM" | "SUPPORT" | "UNKNOWN";

export interface AIAnalysis {
  id: string;
  cycleId: string;
  version: number; // sequencial por ciclo
  actor: ActorRef; // AI ou USER (correção)
  stage: Stage;
  outcome: Outcome;
  estimatedValue: Money | null;
  confidence: number; // 1.0 quando actor USER
  summary: string;
  correctionReason?: string; // obrigatório SE actor USER
  createdAt: string;
  supersededById?: string;
}

/* ── Sales ──────────────────────────────────────────────────────────────── */

export type SaleStatus = "PENDING_REVIEW" | "CONFIRMED" | "CANCELLED" | "REFUNDED";
export type IdentificationSource = "AI" | "MANUAL" | "INTEGRATION";

export interface SaleItem {
  rawName: string; // como apareceu na conversa
  normalizedName: string; // produto canônico
  quantity: number; // int ≥ 1
  unitPrice: Money;
  totalPrice: Money; // derivado (qty×unit), materializado
}

export interface Sale {
  id: string;
  pharmacyId: string;
  contactId: string;
  conversationCycleId: string | null; // NULLABLE (venda manual) — nunca sentinela
  amount: Money;
  status: SaleStatus;
  identificationSource: IdentificationSource;
  confidence: number; // 1.0 se MANUAL
  attribution: Attribution; // VO copiado do ciclo no momento
  soldAt: string;
  items: SaleItem[]; // ≥ 1
}

/* ── Attribution ────────────────────────────────────────────────────────── */

export interface TrackingLink {
  id: string;
  pharmacyId: string;
  token: string; // único global, não-sequencial
  campaignName: string;
  channel: AttributionSource;
  url: string; // DERIVADO: wa.me/<numero>?text=<token>
  active: boolean; // desativar ≠ deletar
  createdAt: string;
  // DERIVADOS (projeções):
  clickCount: number;
  attributedCycleCount: number;
}

/* ── Audit (transversal, append-only) ───────────────────────────────────── */

export type AuditAction =
  | "SALE_CONFIRMED"
  | "SALE_REJECTED"
  | "SALE_REFUNDED"
  | "SALE_VALUE_CORRECTED"
  | "CLASSIFICATION_CORRECTED"
  | "USER_INVITED"
  | "INVITE_CANCELLED"
  | "INVITE_RESENT"
  | "MEMBERSHIP_SUSPENDED"
  | "MEMBERSHIP_REACTIVATED"
  | "WHATSAPP_CONNECTED"
  | "WHATSAPP_DISCONNECTED"
  | "AI_THRESHOLD_CHANGED"
  | "PHARMACY_UPDATED";

export interface AuditLog {
  id: string;
  pharmacyId: string;
  actor: ActorRef; // staff sempre com onBehalfOf
  action: AuditAction;
  entityRef: { type: string; id: string };
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  at: string;
}

/* ── Autorização (Parte 5) ──────────────────────────────────────────────── */

export type Action =
  | "view_dashboard"
  | "view_full_phone"
  | "edit_classification"
  | "confirm_sale"
  | "reject_sale"
  | "refund_sale"
  | "manage_users"
  | "suspend_manager"
  | "manage_whatsapp"
  | "manage_ai"
  | "manage_tracking"
  | "edit_pharmacy"
  | "view_audit"
  | "access_admin"
  | "create_pharmacy"
  | "suspend_pharmacy";

/** Papel efetivo da sessão: tenant (Membership) OU plataforma (PlatformStaff). */
export type SessionRole = TenantRole | PlatformRole;
