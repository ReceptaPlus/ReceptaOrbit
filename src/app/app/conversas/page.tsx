import Link from "next/link";
import { conversationCycles, formatBRL, formatTime } from "@/lib/mock-data";
import {
  ConfidencePill,
  OutcomeBadge,
  SourceBadge,
  StageBadge,
  StatusBadge,
} from "@/components/badges";

export default function ConversasPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display">Conversas</h1>
          <p className="text-sm text-secondary mt-1">
            Ciclos de 24 horas agrupados por contato. {conversationCycles.filter(c => c.needsReview).length} precisam de revisão.
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
        {conversationCycles.map((c) => (
          <li key={c.id}>
            <Link
              href={`/app/conversas/${c.id}`}
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

      {/* Desktop: tabela */}
      <div className="hidden md:block bg-card rounded-xl border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-secondary border-b border-line">
              <th className="px-4 py-3 font-medium">Contato</th>
              <th className="px-4 py-3 font-medium">Origem</th>
              <th className="px-4 py-3 font-medium">Etapa</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Resultado</th>
              <th className="px-4 py-3 font-medium text-right">Valor</th>
              <th className="px-4 py-3 font-medium">Última msg.</th>
              <th className="px-4 py-3 font-medium">Confiança</th>
              <th className="px-4 py-3 font-medium">Revisão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-subtle">
            {conversationCycles.map((c) => (
              <tr key={c.id} className="hover:bg-subtle">
                <td className="px-4 py-3">
                  <Link href={`/app/conversas/${c.id}`} className="font-medium hover:text-primary">
                    {c.contactName}
                  </Link>
                  <p className="text-xs text-muted">{c.phone}</p>
                </td>
                <td className="px-4 py-3"><SourceBadge source={c.attribution.source} /></td>
                <td className="px-4 py-3"><StageBadge stage={c.stage} /></td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3"><OutcomeBadge outcome={c.outcome} /></td>
                <td className="px-4 py-3 text-right font-medium">
                  {c.estimatedValueCents != null ? formatBRL(c.estimatedValueCents) : "—"}
                </td>
                <td className="px-4 py-3 text-secondary">{formatTime(c.lastMessageAt)}</td>
                <td className="px-4 py-3"><ConfidencePill value={c.aiConfidence} /></td>
                <td className="px-4 py-3">
                  {c.needsReview && (
                    <span className="inline-flex items-center rounded-full bg-warning-bg text-warning-text px-2.5 py-0.5 text-xs font-medium">
                      Revisar
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
