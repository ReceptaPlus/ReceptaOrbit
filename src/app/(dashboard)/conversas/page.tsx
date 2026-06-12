import Link from "next/link";
import { listCycles, countNeedsReview } from "@/modules/conversations/api";
import { CyclesTable } from "@/modules/conversations/components/cycles-table";
import { SourceBadge, StageBadge } from "@/components/badges";
import { formatBRL, formatTime } from "@/lib/format";

export default function ConversasPage() {
  const cycles = listCycles();
  const needsReview = countNeedsReview();

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display">Conversas</h1>
          <p className="text-sm text-secondary mt-1">
            Ciclos de 24 horas agrupados por contato. {needsReview} precisam de revisão.
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0">
          {["Período", "Origem", "Etapa", "Status", "Revisão"].map((f) => (
            <button
              key={f}
              className="shrink-0 rounded-lg border border-line bg-card px-3 py-1.5 text-sm text-secondary hover:border-primary hover:text-primary transition-colors"
            >
              {f} ▾
            </button>
          ))}
        </div>
      </header>

      {/* Mobile: cards */}
      <ul className="md:hidden space-y-3">
        {cycles.map((c) => (
          <li key={c.id}>
            <Link
              href={`/conversas/${c.id}`}
              className="block bg-card rounded-xl border border-line p-4 active:bg-subtle"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-sm">{c.contactName}</p>
                <span className="text-xs text-muted">{formatTime(c.lastMessageAt)}</span>
              </div>
              <p className="text-xs text-secondary mt-1 line-clamp-2">{c.aiSummary}</p>
              <div className="flex items-center gap-1.5 flex-wrap mt-3">
                <SourceBadge source={c.attribution.source} />
                <StageBadge stage={c.stage} />
                {c.needsReview && (
                  <span className="inline-flex items-center rounded-full bg-warning-bg text-warning-text px-2.5 py-0.5 text-xs font-medium">
                    Revisar
                  </span>
                )}
                <span className="ml-auto font-semibold text-sm" data-numeric>
                  {c.estimatedValueCents != null ? formatBRL(c.estimatedValueCents) : ""}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop: DataTable (TanStack) */}
      <div className="hidden md:block">
        <CyclesTable data={cycles} />
      </div>
    </div>
  );
}
