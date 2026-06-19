import Link from "next/link";
import { listConversationsVM } from "@/modules/conversations/queries";
import { CyclesTable } from "@/modules/conversations/components/cycles-table";
import { StatusBadge } from "@/components/badges";
import { WaitingBadge } from "@/components/waiting-badge";

export default async function ConversasPage() {
  const cycles = await listConversationsVM();
  const open = cycles.filter((c) => c.status === "OPEN").length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold font-display">Conversas</h1>
        <p className="text-sm text-secondary mt-1">
          Ciclos de 24 horas agrupados por contato. {cycles.length} no total · {open} abertas.
        </p>
      </header>

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
