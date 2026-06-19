/* Chip "aguardando" derivado da direção da última mensagem (V1, sem IA).
   PHARMACY = cliente falou por último (farmácia deve responder). */

const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";

export function WaitingBadge({ waiting }: { waiting: "CUSTOMER" | "PHARMACY" | null }) {
  if (!waiting) return null;
  if (waiting === "PHARMACY") {
    return <span className={`${base} bg-primary-light text-primary`}>Aguardando farmácia</span>;
  }
  return <span className={`${base} bg-warning-bg text-warning-text`}>Aguardando cliente</span>;
}
