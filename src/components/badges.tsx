import {
  AttributionSource,
  CycleStatus,
  Outcome,
  SaleStatus,
  Stage,
  SALE_STATUS_LABEL,
  SOURCE_LABEL,
  STAGE_LABEL,
  STATUS_LABEL,
  OUTCOME_LABEL,
} from "@/lib/mock-data";

const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";

export function StageBadge({ stage }: { stage: Stage }) {
  const styles: Record<Stage, string> = {
    NEW: "bg-primary-light text-primary",
    IN_SERVICE: "bg-warning-bg text-warning-text",
    NEEDS_IDENTIFIED: "bg-warning-bg text-warning-text",
    QUOTE_SENT: "bg-[#EAF1FB] text-[#2D5FA8]",
    NEGOTIATION: "bg-[#EAF1FB] text-[#2D5FA8]",
    SALE_CONFIRMED: "bg-success-bg text-success-text",
    LOST: "bg-danger-bg text-danger-text",
    UNCLASSIFIED: "bg-line-subtle text-secondary",
  };
  return <span className={`${base} ${styles[stage]}`}>{STAGE_LABEL[stage]}</span>;
}

export function StatusBadge({ status }: { status: CycleStatus }) {
  const styles: Record<CycleStatus, string> = {
    OPEN: "bg-success-bg text-success-text",
    WAITING_CUSTOMER: "bg-warning-bg text-warning-text",
    WAITING_PHARMACY: "bg-primary-light text-primary",
    CLOSED: "bg-line-subtle text-secondary",
    ARCHIVED: "bg-line-subtle text-muted",
  };
  return <span className={`${base} ${styles[status]}`}>{STATUS_LABEL[status]}</span>;
}

export function OutcomeBadge({ outcome }: { outcome: Outcome }) {
  const styles: Record<Outcome, string> = {
    SALE: "bg-success-bg text-success-text",
    NO_SALE: "bg-danger-bg text-danger-text",
    ABANDONED: "bg-line-subtle text-secondary",
    SPAM: "bg-line-subtle text-muted",
    SUPPORT: "bg-[#EAF1FB] text-[#2D5FA8]",
    UNKNOWN: "bg-line-subtle text-secondary",
  };
  return <span className={`${base} ${styles[outcome]}`}>{OUTCOME_LABEL[outcome]}</span>;
}

export function SourceBadge({ source }: { source: AttributionSource }) {
  const styles: Record<AttributionSource, string> = {
    META_ADS: "bg-primary-light text-primary",
    GOOGLE_ADS: "bg-[#EAF1FB] text-[#2D5FA8]",
    INSTAGRAM_ORGANIC: "bg-[#FDEBF4] text-[#BE3D7F]",
    FACEBOOK_ORGANIC: "bg-[#EAF1FB] text-[#2D5FA8]",
    WHATSAPP_ORGANIC: "bg-success-bg text-success-text",
    DIRECT: "bg-line-subtle text-secondary",
    REFERRAL: "bg-warning-bg text-warning-text",
    UNKNOWN: "bg-line-subtle text-muted",
  };
  return <span className={`${base} ${styles[source]}`}>{SOURCE_LABEL[source]}</span>;
}

export function SaleStatusBadge({ status }: { status: SaleStatus }) {
  const styles: Record<SaleStatus, string> = {
    CONFIRMED: "bg-success-bg text-success-text",
    PENDING_REVIEW: "bg-warning-bg text-warning-text",
    CANCELLED: "bg-line-subtle text-secondary",
    REFUNDED: "bg-danger-bg text-danger-text",
  };
  return <span className={`${base} ${styles[status]}`}>{SALE_STATUS_LABEL[status]}</span>;
}

export function ConfidencePill({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const tone =
    value >= 0.85 ? "bg-success-bg text-success-text"
    : value >= 0.6 ? "bg-warning-bg text-warning-text"
    : "bg-danger-bg text-danger-text";
  return <span className={`${base} ${tone}`} title="Confiança da IA">{pct}%</span>;
}
