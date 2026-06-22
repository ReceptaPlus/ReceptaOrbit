import Link from "next/link";
import { listConversationsVM } from "@/modules/conversations/queries";
import { CyclesTable } from "@/modules/conversations/components/cycles-table";
import { StatusBadge } from "@/components/badges";
import { WaitingBadge } from "@/components/waiting-badge";

export default async function ConversasPage() {
  const cycles = await listConversationsVM();
  const open = cycles.filter((c) => c.status === "OPEN").length;

  const closed = cycles.filter((c) => c.status === "CLOSED").length;
  const waiting = cycles.filter((c) => c.waiting).length;
  const review = cycles.filter((c) => Boolean((c as unknown as Record<string, unknown>).needsReview)).length;
  const CHIPS = [
    { label: "Todas", count: cycles.length, active: true },
    { label: "Abertas", count: open },
    { label: "Em atendimento", count: waiting },
    { label: "Pendentes revisão", count: review },
    { label: "Encerradas", count: closed },
  ];

  return (
    <div className="space-y-6">
      <header className="animate-fade-in flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-display-lg font-bold tracking-tight text-ink">Conversas</h1>
          <p className="mt-1 text-body text-secondary">
            Acompanhe atendimentos, revise classificações da IA e converta mais.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-line bg-white/70 px-3.5 py-2 text-small font-medium text-secondary backdrop-blur transition-colors hover:border-brand-400 hover:text-brand-500">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M6 12h12M10 18h4" /></svg>
          Filtros avançados
        </button>
      </header>

      <div className="animate-fade-in flex flex-wrap gap-2">
        {CHIPS.map((chip) => (
          <button
            key={chip.label}
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-small font-medium transition-all ${
              chip.active
                ? "border-brand-500 bg-brand-50 text-brand-600"
                : "border-line bg-white/60 text-secondary hover:border-brand-300 hover:text-ink"
            }`}
          >
            {chip.label}
            <span className={`rounded-full px-1.5 text-micro font-semibold ${chip.active ? "bg-brand-500 text-white" : "bg-cream-alt text-muted"}`} data-numeric>
              {chip.count}
            </span>
          </button>
        ))}
      </div>

      {cycles.length === 0 ? (
        <EmptyState />
      ) : (
        <>
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
                    <span className="text-xs text-muted">{c.lastMessageTime}</span>
                  </div>
                  <p className="text-xs text-secondary mt-1 line-clamp-2">{c.lastMessagePreview}</p>
                  <div className="flex items-center gap-1.5 flex-wrap mt-3">
                    <StatusBadge status={c.status} />
                    <WaitingBadge waiting={c.waiting} />
                    <span className="ml-auto text-xs text-muted">{c.messageCount} msgs</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop: DataTable */}
          <div className="hidden md:block">
            <CyclesTable data={cycles} />
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-card rounded-xl border border-line p-10 text-center">
      <p className="font-medium font-display">Nenhuma conversa ainda</p>
      <p className="text-sm text-secondary mt-1">
        Quando o WhatsApp receber mensagens, os ciclos aparecem aqui.
      </p>
    </div>
  );
}
