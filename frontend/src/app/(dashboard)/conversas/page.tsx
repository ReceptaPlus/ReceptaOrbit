import Link from "next/link";
import { listConversationsVM, type CycleRowVM } from "@/modules/conversations/queries";
import { getWhatsAppStatusVM, whatsAppStateLabel } from "@/modules/settings/whatsapp";
import { CyclesTable } from "@/modules/conversations/components/cycles-table";
import { StatusBadge } from "@/components/badges";
import { WaitingBadge } from "@/components/waiting-badge";

type FilterKey = "todas" | "abertas" | "aguardando" | "encerradas";

const FILTERS: { key: FilterKey; label: string; test: (c: CycleRowVM) => boolean }[] = [
  { key: "todas", label: "Todas", test: () => true },
  { key: "abertas", label: "Abertas", test: (c) => c.status === "OPEN" },
  { key: "aguardando", label: "Aguardando resposta", test: (c) => c.waiting === "PHARMACY" },
  { key: "encerradas", label: "Encerradas", test: (c) => c.status === "CLOSED" },
];

export default async function ConversasPage({
  searchParams,
}: {
  searchParams: Promise<{ f?: string }>;
}) {
  const [{ f }, cycles, wa] = await Promise.all([
    searchParams,
    listConversationsVM(),
    getWhatsAppStatusVM(),
  ]);

  const active = FILTERS.find((x) => x.key === f) ?? FILTERS[0];
  const filtered = cycles.filter(active.test);
  const disconnected = wa.state !== "CONNECTED";

  return (
    <div className="space-y-6">
      <header className="animate-fade-in">
        <h1 className="font-display text-display-lg font-bold tracking-tight text-ink">Conversas</h1>
        <p className="mt-1 text-body text-secondary">
          Acompanhe os atendimentos recebidos pelo WhatsApp da farmácia.
        </p>
      </header>

      {disconnected && (
        <div className="card-premium flex flex-wrap items-center justify-between gap-4 border-l-4 border-warning-text/60 p-4">
          <div>
            <p className="font-medium text-ink">WhatsApp {whatsAppStateLabel(wa.state).toLowerCase()}</p>
            <p className="text-small text-secondary">
              Sem conexão ativa não chegam novas conversas. Conecte para começar a receber.
            </p>
          </div>
          <Link href="/configuracoes/whatsapp" className="btn-primary shrink-0">
            Conectar WhatsApp
          </Link>
        </div>
      )}

      <div className="animate-fade-in flex flex-wrap gap-2">
        {FILTERS.map((chip) => {
          const isActive = chip.key === active.key;
          return (
            <Link
              key={chip.key}
              href={chip.key === "todas" ? "/conversas" : `/conversas?f=${chip.key}`}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-small font-medium transition-all ${
                isActive
                  ? "border-brand-500 bg-brand-50 text-brand-600"
                  : "border-line bg-white/60 text-secondary hover:border-brand-300 hover:text-ink"
              }`}
            >
              {chip.label}
              <span
                className={`rounded-full px-1.5 text-micro font-semibold ${
                  isActive ? "bg-brand-500 text-white" : "bg-cream-alt text-muted"
                }`}
                data-numeric
              >
                {cycles.filter(chip.test).length}
              </span>
            </Link>
          );
        })}
      </div>

      {cycles.length === 0 ? (
        <EmptyState connected={!disconnected} />
      ) : filtered.length === 0 ? (
        <div className="card-premium p-10 text-center">
          <p className="font-display font-medium text-ink">Nenhuma conversa neste filtro</p>
          <p className="mt-1 text-small text-secondary">Troque o filtro acima para ver outras conversas.</p>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <ul className="md:hidden space-y-3">
            {filtered.map((c) => (
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
            <CyclesTable data={filtered} />
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState({ connected }: { connected: boolean }) {
  return (
    <div className="bg-card rounded-xl border border-line p-10 text-center">
      <p className="font-medium font-display">Nenhuma conversa ainda</p>
      <p className="text-sm text-secondary mt-1">
        {connected
          ? "Quando o WhatsApp receber mensagens, os ciclos aparecem aqui."
          : "Conecte o WhatsApp para começar a receber conversas."}
      </p>
    </div>
  );
}
