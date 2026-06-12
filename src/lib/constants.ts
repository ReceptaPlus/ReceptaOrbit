import type {
  AttributionMethod,
  AttributionSource,
  CycleStatus,
  Outcome,
  Stage,
} from "@/modules/conversations/types";
import type { SaleStatus } from "@/modules/sales/types";
import type { UserRole } from "@/modules/settings/types";

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

export const ROLE_LABEL: Record<UserRole, string> = {
  RECEPTA_ADMIN: "Admin Recepta",
  PHARMACY_MANAGER: "Gerente",
  PHARMACY_VIEWER: "Visualizador",
};

export const ROUTES = {
  login: "/login",
  dashboard: "/dashboard",
  conversas: "/conversas",
  conversa: (id: string) => `/conversas/${id}`,
  vendas: "/vendas",
  revisao: "/vendas/revisao",
  clientes: "/clientes",
  cliente: (id: string) => `/clientes/${id}`,
  configuracoes: "/configuracoes/usuarios",
} as const;
