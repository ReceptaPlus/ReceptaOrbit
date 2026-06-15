import Link from "next/link";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "neutral";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: string;
  direction?: Direction;
  href?: string;
  highlight?: boolean;
}

const deltaTone: Record<Direction, string> = {
  up: "bg-success-bg text-success-text",
  down: "bg-danger-bg text-danger-text",
  neutral: "bg-line-subtle text-secondary",
};

const arrow: Record<Direction, string> = { up: "↑", down: "↓", neutral: "" };

export function KpiCard({ label, value, delta, direction = "neutral", href, highlight }: KpiCardProps) {
  const body = (
    <div
      className={cn(
        "group relative rounded-xl border p-5 shadow-xs transition-all duration-150",
        highlight ? "bg-warning-bg border-warning-text/25" : "bg-card border-line",
        href && "hover:border-primary hover:shadow-sm"
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-caption font-medium uppercase tracking-wide text-secondary">{label}</p>
        {href && (
          <span className="text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden>
            →
          </span>
        )}
      </div>
      <p className="text-display font-bold font-display mt-2 tabular-nums">{value}</p>
      {delta && (
        <span
          className={`inline-flex items-center gap-1 mt-2 rounded-full px-2 py-0.5 text-caption font-medium ${deltaTone[direction]}`}
        >
          {arrow[direction] && <span aria-hidden>{arrow[direction]}</span>}
          {delta}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
        {body}
      </Link>
    );
  }
  return body;
}
