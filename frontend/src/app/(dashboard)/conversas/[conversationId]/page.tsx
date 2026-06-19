import Link from "next/link";
import { notFound } from "next/navigation";
import { getConversationVM } from "@/modules/conversations/queries";
import { StatusBadge } from "@/components/badges";
import { WaitingBadge } from "@/components/waiting-badge";

export default async function ConversaDetalhePage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const cycle = await getConversationVM(conversationId);
  if (!cycle) notFound();

  return (
    <div className="space-y-6">
      <header>
        <Link href="/conversas" className="text-sm text-secondary hover:text-primary">
          ← Conversas
        </Link>
        <h1 className="text-2xl font-bold font-display mt-1">{cycle.contactName}</h1>
        <p className="text-sm text-secondary">{cycle.phoneDisplay}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Timeline de mensagens */}
        <section className="lg:col-span-2 bg-card rounded-xl border border-line p-5">
          <h2 className="font-semibold font-display mb-4">Linha do tempo</h2>
          {cycle.messages.length === 0 ? (
            <p className="text-sm text-secondary">Sem mensagens neste ciclo.</p>
          ) : (
            <div className="space-y-3" role="log">
              {cycle.messages.map((m) => (
                <div key={m.id} className={`flex ${m.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.direction === "OUTBOUND"
                        ? "bg-primary text-white rounded-br-md"
                        : "bg-subtle border border-line-subtle rounded-bl-md"
                    }`}
                  >
                    <span className="sr-only">{m.direction === "OUTBOUND" ? "Farmácia: " : "Cliente: "}</span>
                    <p>{m.text}</p>
                    <p className={`text-[10px] mt-1 ${m.direction === "OUTBOUND" ? "text-white/70" : "text-muted"}`}>
                      {m.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Painel lateral (V1: status + contato; sem classificação/IA) */}
        <div className="space-y-4">
          <section className="bg-card rounded-xl border border-line p-5 space-y-3">
            <h2 className="font-semibold font-display">Situação</h2>
            <Row label="Status"><StatusBadge status={cycle.status} /></Row>
            <Row label="Aguardando">
              {cycle.waiting ? <WaitingBadge waiting={cycle.waiting} /> : <span className="text-sm text-secondary">—</span>}
            </Row>
            <Row label="Mensagens"><span className="text-sm font-medium">{cycle.messages.length}</span></Row>
          </section>

          <section className="bg-card rounded-xl border border-line p-5">
            <h2 className="font-semibold font-display mb-2">Contato</h2>
            <Link href={`/clientes/${cycle.contactId}`} className="text-sm text-primary hover:underline">
              Ver ficha do contato →
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-secondary">{label}</span>
      {children}
    </div>
  );
}
