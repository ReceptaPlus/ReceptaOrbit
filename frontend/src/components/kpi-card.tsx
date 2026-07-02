import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: { value: string; direction: "up" | "down" | "neutral" };
  hint?: string;
  icon?: ReactNode;
  accent?: boolean;
  index?: number;
}

/* KPI Card premium — superfície de vidro sobre a atmosfera, número protagonista,
   delta com cor semântica, micro fade-in escalonado. */
export function KpiCard({ label, value, delta, hint, icon, accent, index = 0 }: KpiCardProps) {
  const dir = delta?.direction ?? "neutral";
  const deltaColor =
    dir === "up"
      ? "text-success-text bg-success-bg"
      : dir === "down"
        ? "text-danger-text bg-danger-bg"
        : "text-secondary bg-cream-alt";

  return (
    <div
      className={`card-premium group animate-fade-in-up relative overflow-hidden p-5 ${accent ? "shine" : ""}`}
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      {accent && (
        <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-brand-500/15 to-brand-400/5 blur-2xl" />
      )}
      <div className="relative flex items-start justify-between">
        <p className="text-caption font-medium text-secondary">{label}</p>
        {icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cream-alt text-brand-500 transition-colors group-hover:bg-brand-50">
            {icon}
          </span>
        )}
      </div>
      <p className="relative mt-2 font-display text-display-lg font-bold tracking-tight text-ink" data-numeric>
        {value}
      </p>
      <div className="relative mt-2 flex items-center gap-2">
        {delta && (
          <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-micro font-semibold ${deltaColor}`}>
            {dir === "up" ? "▲" : dir === "down" ? "▼" : "—"} {delta.value}
          </span>
        )}
        {hint && <span className="text-micro text-muted">{hint}</span>}
      </div>
    </div>
  );
}
