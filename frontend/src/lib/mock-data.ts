/* ==========================================================================
   Recepta Orbit — Mock Data (LEGADO — EM DESATIVAÇÃO)
   ⚠️  NÃO USAR EM CÓDIGO NOVO. Fonte canônica: src/mocks/* (formato do domínio
   validado em docs/CONTRATOS-FRONTEND.md). Estes dados violam contratos
   congelados (classificação inline no ciclo, ids "c-000" sentinela, staff no
   tenant). Cada module/<x>/api.ts migra para src/mocks e este arquivo morre.
   ========================================================================== */

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

export type SaleStatus = "PENDING_REVIEW" | "CONFIRMED" | "CANCELLED" | "REFUNDED";
export type IdentificationSource = "AI" | "MANUAL" | "INTEGRATION";

export interface Message {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  textContent: string;
  sentAt: string;
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
  attribution: {
    source: AttributionSource;
    method: AttributionMethod;
    confidence: number;
    campaignName?: string;
  };
  aiSummary: string;
  aiConfidence: number;
  messages: Message[];
}

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

export interface PharmacyUser {
  id: string;
  name: string;
  email: string;
  role: "RECEPTA_ADMIN" | "PHARMACY_MANAGER" | "PHARMACY_VIEWER";
  status: "ACTIVE" | "SUSPENDED";
  lastLoginAt: string;
}

/* ── Labels PT-BR ─────────────────────────────────────────────────────── */

export const STAGE_LABEL: Record<Stage, string> = {
  NEW: "Nova",
  IN_SERVICE: "Em atendimento",
  NEEDS_IDENTIFIED: "Necessidade identificada",
  QUOTE_SENT: "Orçamento enviado",
  NEGOTIATION: "Negociação",
  SALE_CONFIRMED: "Venda confirmada",
  LOST: "Perdida",
  UNCLASSIFIED: "Não classificada",
};

export const STATUS_LABEL: Record<CycleStatus, string> = {
  OPEN: "Aberta",
  WAITING_CUSTOMER: "Aguardando cliente",
  WAITING_PHARMACY: "Aguardando farmácia",
  CLOSED: "Encerrada",
  ARCHIVED: "Arquivada",
};

export const OUTCOME_LABEL: Record<Outcome, string> = {
  SALE: "Venda",
  NO_SALE: "Sem venda",
  ABANDONED: "Abandonada",
  SPAM: "Spam",
  SUPPORT: "Suporte",
  UNKNOWN: "Indefinido",
};

export const SOURCE_LABEL: Record<AttributionSource, string> = {
  META_ADS: "Meta Ads",
  GOOGLE_ADS: "Google Ads",
  INSTAGRAM_ORGANIC: "Instagram orgânico",
  FACEBOOK_ORGANIC: "Facebook orgânico",
  WHATSAPP_ORGANIC: "WhatsApp orgânico",
  DIRECT: "Direto",
  REFERRAL: "Indicação",
  UNKNOWN: "Desconhecida",
};

export const METHOD_LABEL: Record<AttributionMethod, string> = {
  PROVIDER_REFERRAL: "Referral do provedor",
  TRACKING_TOKEN: "Token de rastreamento",
  CLICK_IDENTIFIER: "Click ID",
  UTM: "UTM",
  MANUAL: "Manual",
  AI_INFERENCE: "Inferência por IA",
};

export const SALE_STATUS_LABEL: Record<SaleStatus, string> = {
  PENDING_REVIEW: "Pendente de revisão",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  REFUNDED: "Estornada",
};

/* ── Conversas (ciclos de 24h) ────────────────────────────────────────── */

export const conversationCycles: ConversationCycle[] = [
  {
    id: "c-001",
    contactId: "ct-001",
    contactName: "Maria Silva",
    phone: "(11) 9****-3421",
    startedAt: "2026-06-10T14:42:00",
    lastMessageAt: "2026-06-10T14:51:00",
    status: "CLOSED",
    stage: "SALE_CONFIRMED",
    outcome: "SALE",
    estimatedValueCents: 8900,
    needsReview: false,
    attribution: { source: "META_ADS", method: "PROVIDER_REFERRAL", confidence: 0.97, campaignName: "Genéricos Junho" },
    aiSummary: "Cliente comprou 3 caixas de dipirona 500mg com entrega. Pagamento via PIX confirmado.",
    aiConfidence: 0.91,
    messages: [
      { id: "m1", direction: "INBOUND", textContent: "Boa tarde! Gostaria de saber sobre dipirona 500mg.", sentAt: "2026-06-10T14:42:00" },
      { id: "m2", direction: "OUTBOUND", textContent: "Olá Maria! Temos em estoque. Caixa com 10 comprimidos por R$ 12,90. Deseja encomendar?", sentAt: "2026-06-10T14:43:00" },
      { id: "m3", direction: "INBOUND", textContent: "Sim, quero 3 caixas. Entrega disponível?", sentAt: "2026-06-10T14:45:00" },
      { id: "m4", direction: "OUTBOUND", textContent: "Sim! Entregamos em até 2h. Endereço de entrega?", sentAt: "2026-06-10T14:46:00" },
      { id: "m5", direction: "INBOUND", textContent: "Rua das Flores, 123 – Jardim Europa.", sentAt: "2026-06-10T14:48:00" },
      { id: "m6", direction: "OUTBOUND", textContent: "Pedido confirmado! Total R$ 89,00. Pagamento via PIX. Você receberá uma confirmação por WhatsApp.", sentAt: "2026-06-10T14:51:00" },
    ],
  },
  {
    id: "c-002",
    contactId: "ct-009",
    contactName: "João Pereira",
    phone: "(11) 9****-7832",
    startedAt: "2026-06-10T13:10:00",
    lastMessageAt: "2026-06-10T13:22:00",
    status: "WAITING_PHARMACY",
    stage: "QUOTE_SENT",
    outcome: "UNKNOWN",
    estimatedValueCents: 12290,
    needsReview: true,
    attribution: { source: "GOOGLE_ADS", method: "CLICK_IDENTIFIER", confidence: 0.88, campaignName: "Vitaminas Search" },
    aiSummary: "Cliente pediu orçamento de vitaminas D, C e Ômega 3. Orçamento parcial enviado; aguarda resposta sobre vitamina C.",
    aiConfidence: 0.74,
    messages: [
      { id: "m1", direction: "INBOUND", textContent: "Olá, preciso de orçamento para vitamina D 2000UI e Ômega 3.", sentAt: "2026-06-10T13:10:00" },
      { id: "m2", direction: "OUTBOUND", textContent: "Olá João! Vitamina D 2000UI: R$ 32,90 (60 cápsulas). Ômega 3: R$ 45,00 (60 cápsulas).", sentAt: "2026-06-10T13:15:00" },
      { id: "m3", direction: "INBOUND", textContent: "Preciso de orçamento para vitaminas D, C e Ômega 3.", sentAt: "2026-06-10T13:22:00" },
    ],
  },
  {
    id: "c-003",
    contactId: "ct-005",
    contactName: "Ana Costa",
    phone: "(21) 9****-1234",
    startedAt: "2026-06-10T10:55:00",
    lastMessageAt: "2026-06-10T11:20:00",
    status: "CLOSED",
    stage: "SALE_CONFIRMED",
    outcome: "SALE",
    estimatedValueCents: 4800,
    needsReview: false,
    attribution: { source: "INSTAGRAM_ORGANIC", method: "AI_INFERENCE", confidence: 0.62 },
    aiSummary: "Cliente veio pelo Instagram, comprou colágeno Verisol via PIX. Entrega no mesmo dia.",
    aiConfidence: 0.89,
    messages: [
      { id: "m1", direction: "INBOUND", textContent: "Oi! Vi no Instagram sobre o colágeno. Vocês têm?", sentAt: "2026-06-10T10:55:00" },
      { id: "m2", direction: "OUTBOUND", textContent: "Oi Ana! Sim, temos Colágeno Verisol em pó. R$ 48,00 / 150g.", sentAt: "2026-06-10T10:58:00" },
      { id: "m3", direction: "INBOUND", textContent: "Vou querer! PIX mesmo.", sentAt: "2026-06-10T11:05:00" },
      { id: "m4", direction: "OUTBOUND", textContent: "Pix enviado! Confirme o pagamento e enviaremos hoje.", sentAt: "2026-06-10T11:10:00" },
      { id: "m5", direction: "INBOUND", textContent: "Pedido entregue, obrigada!", sentAt: "2026-06-10T11:20:00" },
    ],
  },
  {
    id: "c-004",
    contactId: "ct-003",
    contactName: "Rafael Lima",
    phone: "(11) 9****-5543",
    startedAt: "2026-06-10T09:48:00",
    lastMessageAt: "2026-06-10T10:07:00",
    status: "CLOSED",
    stage: "SALE_CONFIRMED",
    outcome: "SALE",
    estimatedValueCents: 14500,
    needsReview: false,
    attribution: { source: "META_ADS", method: "TRACKING_TOKEN", confidence: 0.95, campaignName: "Remarketing Maio" },
    aiSummary: "Cliente recorrente comprou 4 caixas de omeprazol e 4 de loratadina com entrega.",
    aiConfidence: 0.93,
    messages: [
      { id: "m1", direction: "INBOUND", textContent: "Bom dia! Preciso de omeprazol 20mg e loratadina 10mg.", sentAt: "2026-06-10T09:48:00" },
      { id: "m2", direction: "OUTBOUND", textContent: "Bom dia Rafael! Omeprazol 20mg (30cp): R$ 18,50. Loratadina 10mg (10cp): R$ 12,90.", sentAt: "2026-06-10T09:52:00" },
      { id: "m3", direction: "INBOUND", textContent: "Pode separar 4 caixas de cada!", sentAt: "2026-06-10T10:00:00" },
      { id: "m4", direction: "OUTBOUND", textContent: "Prontinho! R$ 125,60 + entrega R$ 9,90 = R$ 145,00.", sentAt: "2026-06-10T10:05:00" },
      { id: "m5", direction: "INBOUND", textContent: "Perfeito, muito obrigado!", sentAt: "2026-06-10T10:07:00" },
    ],
  },
  {
    id: "c-005",
    contactId: "ct-008",
    contactName: "Beatriz Souza",
    phone: "(11) 9****-9981",
    startedAt: "2026-06-10T09:45:00",
    lastMessageAt: "2026-06-10T09:45:00",
    status: "WAITING_PHARMACY",
    stage: "NEW",
    outcome: "UNKNOWN",
    estimatedValueCents: null,
    needsReview: false,
    attribution: { source: "UNKNOWN", method: "AI_INFERENCE", confidence: 0.3 },
    aiSummary: "Cliente perguntou sobre manipulado para insônia. Sem resposta da farmácia até o momento.",
    aiConfidence: 0.68,
    messages: [
      { id: "m1", direction: "INBOUND", textContent: "Olá, vocês têm algum manipulado para insônia? Gostaria de saber os valores.", sentAt: "2026-06-10T09:45:00" },
    ],
  },
  {
    id: "c-006",
    contactId: "ct-004",
    contactName: "Carlos Andrade",
    phone: "(11) 9****-2211",
    startedAt: "2026-06-10T08:20:00",
    lastMessageAt: "2026-06-10T08:30:00",
    status: "CLOSED",
    stage: "SALE_CONFIRMED",
    outcome: "SALE",
    estimatedValueCents: 21000,
    needsReview: true,
    attribution: { source: "GOOGLE_ADS", method: "UTM", confidence: 0.81, campaignName: "Marca Institucional" },
    aiSummary: "Cliente foi à loja retirar antibiótico com receita. Venda presencial estimada — requer confirmação manual do valor.",
    aiConfidence: 0.55,
    messages: [
      { id: "m1", direction: "INBOUND", textContent: "Preciso de antibiótico com receita, posso levar pessoalmente?", sentAt: "2026-06-10T08:20:00" },
      { id: "m2", direction: "OUTBOUND", textContent: "Claro Carlos! Estamos abertos das 8h às 22h. Pode vir quando quiser.", sentAt: "2026-06-10T08:25:00" },
      { id: "m3", direction: "INBOUND", textContent: "Combinado. Até logo!", sentAt: "2026-06-10T08:30:00" },
    ],
  },
  {
    id: "c-007",
    contactId: "ct-006",
    contactName: "Pedro Santos",
    phone: "(11) 9****-6678",
    startedAt: "2026-06-09T16:02:00",
    lastMessageAt: "2026-06-09T16:20:00",
    status: "CLOSED",
    stage: "SALE_CONFIRMED",
    outcome: "SALE",
    estimatedValueCents: 4500,
    needsReview: false,
    attribution: { source: "GOOGLE_ADS", method: "CLICK_IDENTIFIER", confidence: 0.92, campaignName: "Vitaminas Search" },
    aiSummary: "Compra direta de Ômega 3 com retirada na loja.",
    aiConfidence: 0.95,
    messages: [
      { id: "m1", direction: "INBOUND", textContent: "Tem Ômega 3? Quanto custa?", sentAt: "2026-06-09T16:02:00" },
      { id: "m2", direction: "OUTBOUND", textContent: "Temos sim, Pedro! R$ 45,00 o pote com 60 cápsulas.", sentAt: "2026-06-09T16:08:00" },
      { id: "m3", direction: "INBOUND", textContent: "Passo aí em 1 hora pra pegar. Obrigado!", sentAt: "2026-06-09T16:20:00" },
    ],
  },
  {
    id: "c-008",
    contactId: "ct-007",
    contactName: "Fernanda Lima",
    phone: "(11) 9****-4430",
    startedAt: "2026-06-09T14:00:00",
    lastMessageAt: "2026-06-09T14:15:00",
    status: "CLOSED",
    stage: "LOST",
    outcome: "NO_SALE",
    estimatedValueCents: 1290,
    needsReview: false,
    attribution: { source: "DIRECT", method: "MANUAL", confidence: 1.0 },
    aiSummary: "Cliente achou o preço da loratadina alto e não fechou. Motivo de perda: preço.",
    aiConfidence: 0.87,
    messages: [
      { id: "m1", direction: "INBOUND", textContent: "Quanto está a loratadina?", sentAt: "2026-06-09T14:00:00" },
      { id: "m2", direction: "OUTBOUND", textContent: "R$ 12,90 a caixa com 10 comprimidos.", sentAt: "2026-06-09T14:05:00" },
      { id: "m3", direction: "INBOUND", textContent: "Achei caro, vou pesquisar. Obrigada.", sentAt: "2026-06-09T14:15:00" },
    ],
  },
];

/* ── Vendas ──────────────────────────────────────────────────────────── */

export const sales: Sale[] = [
  {
    id: "s-1041",
    contactId: "ct-001",
    contactName: "Maria Silva",
    conversationCycleId: "c-001",
    netAmountCents: 8900,
    status: "CONFIRMED",
    identificationSource: "AI",
    confidence: 0.91,
    soldAt: "2026-06-10T14:51:00",
    attributionSource: "META_ADS",
    campaignName: "Genéricos Junho",
    items: [
      { productName: "Dipirona 500mg", rawProductName: "dipirona 500", quantity: 3, unitPriceCents: 1290, totalPriceCents: 3870 },
    ],
  },
  {
    id: "s-1040",
    contactId: "ct-003",
    contactName: "Rafael Lima",
    conversationCycleId: "c-004",
    netAmountCents: 14500,
    status: "CONFIRMED",
    identificationSource: "AI",
    confidence: 0.93,
    soldAt: "2026-06-10T10:07:00",
    attributionSource: "META_ADS",
    campaignName: "Remarketing Maio",
    items: [
      { productName: "Omeprazol 20mg", rawProductName: "omeprazol", quantity: 4, unitPriceCents: 1850, totalPriceCents: 7400 },
      { productName: "Loratadina 10mg", rawProductName: "loratadina", quantity: 4, unitPriceCents: 1290, totalPriceCents: 5160 },
    ],
  },
  {
    id: "s-1039",
    contactId: "ct-005",
    contactName: "Ana Costa",
    conversationCycleId: "c-003",
    netAmountCents: 4800,
    status: "CONFIRMED",
    identificationSource: "AI",
    confidence: 0.89,
    soldAt: "2026-06-10T11:20:00",
    attributionSource: "INSTAGRAM_ORGANIC",
    items: [
      { productName: "Colágeno Verisol", rawProductName: "colageno verisol po", quantity: 1, unitPriceCents: 4800, totalPriceCents: 4800 },
    ],
  },
  {
    id: "s-1038",
    contactId: "ct-004",
    contactName: "Carlos Andrade",
    conversationCycleId: "c-006",
    netAmountCents: 21000,
    status: "PENDING_REVIEW",
    identificationSource: "AI",
    confidence: 0.55,
    soldAt: "2026-06-10T08:30:00",
    attributionSource: "GOOGLE_ADS",
    campaignName: "Marca Institucional",
    items: [
      { productName: "Manipulado (antibiótico)", rawProductName: "antibiotico receita", quantity: 1, unitPriceCents: 21000, totalPriceCents: 21000 },
    ],
  },
  {
    id: "s-1037",
    contactId: "ct-006",
    contactName: "Pedro Santos",
    conversationCycleId: "c-007",
    netAmountCents: 4500,
    status: "CONFIRMED",
    identificationSource: "MANUAL",
    confidence: 1.0,
    soldAt: "2026-06-09T17:30:00",
    attributionSource: "GOOGLE_ADS",
    campaignName: "Vitaminas Search",
    items: [
      { productName: "Ômega 3", rawProductName: "omega 3 60caps", quantity: 1, unitPriceCents: 4500, totalPriceCents: 4500 },
    ],
  },
  {
    id: "s-1036",
    contactId: "ct-002",
    contactName: "Luciana Ribeiro",
    conversationCycleId: "c-000",
    netAmountCents: 3290,
    status: "REFUNDED",
    identificationSource: "MANUAL",
    confidence: 1.0,
    soldAt: "2026-06-08T11:30:00",
    attributionSource: "WHATSAPP_ORGANIC",
    items: [
      { productName: "Vitamina D 2000UI", rawProductName: "vitamina d", quantity: 1, unitPriceCents: 3290, totalPriceCents: 3290 },
    ],
  },
];

/* ── Contatos ────────────────────────────────────────────────────────── */

export const contacts: Contact[] = [
  { id: "ct-001", name: "Maria Silva", phoneE164: "+5511990003421", phoneMasked: "(11) 9****-3421", firstSeenAt: "2026-03-12", lastSeenAt: "2026-06-10T14:51:00", conversationCount: 5, purchaseCount: 3, totalSpentCents: 18400, recurrentSources: ["META_ADS"] },
  { id: "ct-002", name: "Luciana Ribeiro", phoneE164: "+5511990008812", phoneMasked: "(11) 9****-8812", firstSeenAt: "2026-04-02", lastSeenAt: "2026-06-09T08:15:00", conversationCount: 4, purchaseCount: 2, totalSpentCents: 15600, recurrentSources: ["INSTAGRAM_ORGANIC", "WHATSAPP_ORGANIC"] },
  { id: "ct-003", name: "Rafael Lima", phoneE164: "+5511990005543", phoneMasked: "(11) 9****-5543", firstSeenAt: "2025-11-20", lastSeenAt: "2026-06-10T10:07:00", conversationCount: 12, purchaseCount: 7, totalSpentCents: 52100, recurrentSources: ["META_ADS"], notes: "Cliente recorrente, prefere entrega." },
  { id: "ct-004", name: "Carlos Andrade", phoneE164: "+5511990002211", phoneMasked: "(11) 9****-2211", firstSeenAt: "2026-01-15", lastSeenAt: "2026-06-10T08:30:00", conversationCount: 6, purchaseCount: 4, totalSpentCents: 38000, recurrentSources: ["GOOGLE_ADS"] },
  { id: "ct-005", name: "Ana Costa", phoneE164: "+5521990001234", phoneMasked: "(21) 9****-1234", firstSeenAt: "2026-06-10", lastSeenAt: "2026-06-10T11:20:00", conversationCount: 3, purchaseCount: 1, totalSpentCents: 4800, recurrentSources: ["INSTAGRAM_ORGANIC"] },
  { id: "ct-006", name: "Pedro Santos", phoneE164: "+5511990006678", phoneMasked: "(11) 9****-6678", firstSeenAt: "2026-02-08", lastSeenAt: "2026-06-09T16:20:00", conversationCount: 8, purchaseCount: 5, totalSpentCents: 29000, recurrentSources: ["GOOGLE_ADS"] },
  { id: "ct-007", name: "Fernanda Lima", phoneE164: "+5511990004430", phoneMasked: "(11) 9****-4430", firstSeenAt: "2026-06-08", lastSeenAt: "2026-06-09T14:15:00", conversationCount: 1, purchaseCount: 0, totalSpentCents: 0, recurrentSources: ["DIRECT"] },
  { id: "ct-008", name: "Beatriz Souza", phoneE164: "+5511990009981", phoneMasked: "(11) 9****-9981", firstSeenAt: "2026-06-10", lastSeenAt: "2026-06-10T09:45:00", conversationCount: 1, purchaseCount: 0, totalSpentCents: 0, recurrentSources: ["UNKNOWN"] },
  { id: "ct-009", name: "João Pereira", phoneE164: "+5511990007832", phoneMasked: "(11) 9****-7832", firstSeenAt: "2026-06-10", lastSeenAt: "2026-06-10T13:22:00", conversationCount: 2, purchaseCount: 0, totalSpentCents: 0, recurrentSources: ["GOOGLE_ADS"] },
];

/* ── Usuários ────────────────────────────────────────────────────────── */

export const users: PharmacyUser[] = [
  { id: "u-1", name: "Antonio Ferreira", email: "antonio@dspaulo.com.br", role: "PHARMACY_MANAGER", status: "ACTIVE", lastLoginAt: "Hoje, 14:30" },
  { id: "u-2", name: "Camila Ramos", email: "camila@dspaulo.com.br", role: "PHARMACY_MANAGER", status: "ACTIVE", lastLoginAt: "Hoje, 11:15" },
  { id: "u-3", name: "Daniel Melo", email: "daniel@dspaulo.com.br", role: "PHARMACY_VIEWER", status: "ACTIVE", lastLoginAt: "Ontem, 16:00" },
  { id: "u-4", name: "Suporte Recepta", email: "suporte@receptaplus.com.br", role: "RECEPTA_ADMIN", status: "ACTIVE", lastLoginAt: "Hoje, 09:00" },
];

/* ── Indicadores (seção 13) ──────────────────────────────────────────── */

export const dashboard = {
  totalSoldCents: sales.filter(s => s.status === "CONFIRMED").reduce((a, s) => a + s.netAmountCents, 0),
  confirmedSalesCount: sales.filter(s => s.status === "CONFIRMED").length,
  pendingReviewCount: sales.filter(s => s.status === "PENDING_REVIEW").length,
  openConversations: conversationCycles.filter(c => c.status !== "CLOSED" && c.status !== "ARCHIVED").length,
  conversionRate: 0.57, // vendas confirmadas / conversas comerciais encerradas
  avgTicketCents: Math.round(
    sales.filter(s => s.status === "CONFIRMED").reduce((a, s) => a + s.netAmountCents, 0) /
    Math.max(1, sales.filter(s => s.status === "CONFIRMED").length)
  ),
  weekBars: [48, 61, 55, 78, 92, 85, 104, 97, 118, 112, 134, 128, 148, 162],
  topProducts: [
    { name: "Dipirona 500mg", qty: 38, pct: 100 },
    { name: "Vitamina D 2000UI", qty: 31, pct: 82 },
    { name: "Omeprazol 20mg", qty: 27, pct: 71 },
    { name: "Loratadina 10mg", qty: 22, pct: 58 },
    { name: "Colágeno Verisol", qty: 18, pct: 47 },
  ],
  salesBySource: [
    { source: "META_ADS" as AttributionSource, totalCents: 23400, count: 2 },
    { source: "GOOGLE_ADS" as AttributionSource, totalCents: 4500, count: 1 },
    { source: "INSTAGRAM_ORGANIC" as AttributionSource, totalCents: 4800, count: 1 },
    { source: "WHATSAPP_ORGANIC" as AttributionSource, totalCents: 0, count: 0 },
  ],
};

/* ── Helpers ─────────────────────────────────────────────────────────── */

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
