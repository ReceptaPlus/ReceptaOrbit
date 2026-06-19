import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerVM } from "@/modules/customers/queries";
import { StatusBadge } from "@/components/badges";

export default async function ClienteFichaPage({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const { contactId } = await params;
  const contact = await getCustomerVM(contactId);
  if (!contact) notFound();

  const open = contact.cycles.filter((c) => c.status === "OPEN").length;

  return (
    <div className="space-y-6">
      <header>
        <Link href="/clientes" className="text-sm text-secondary hover:text-primary">
          ← Clientes
        </Link>
        <div className="flex items-center gap-4 mt-2">
          <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center font-semibold">
            {contact.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display">{contact.name}</h1>
            <p className="text-sm text-secondary">{contact.phoneDisplay}</p>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Kpi label="Conversas" value={String(contact.conversationCount)} />
        <Kpi label="Abertas" value={String(open)} />
        <Kpi label="Último contato" value={contact.lastSeen} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <section className="bg-card rounded-xl border border-line p-5">
          <h2 className="font-semibold font-display mb-4">Histórico de conversas</h2>
          {contact.cycles.length === 0 ? (
            <p className="text-sm text-secondary">Nenhum ciclo registrado.</p>
          ) : (
            <ul className="divide-y divide-line-subtle">
              {contact.cycles.map((c) => (
                <li key={c.id}>
                  <Link href={`/conversas/${c.id}`} className="flex items-center gap-3 py-3 hover:bg-subtle -mx-2 px-2 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{c.messageCount} mensage{c.messageCount === 1 ? "m" : "ns"}</p>
                      <p className="text-xs text-muted mt-0.5">Última às {c.lastMessageTime}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-card rounded-xl border border-line p-5 space-y-3">
          <h2 className="font-semibold font-display">Dados do contato</h2>
          <Row label="Telefone">{contact.phoneDisplay}</Row>
          <Row label="Primeiro contato">{contact.firstSeen}</Row>
          <Row label="Última interação">{contact.lastSeen}</Row>
          {contact.notes && (
            <div className="pt-2 border-t border-line-subtle">
              <p className="text-sm text-secondary">Observações</p>
              <p className="text-sm mt-1">{contact.notes}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card rounded-xl border border-line p-5">
      <p className="text-sm text-secondary">{label}</p>
      <p className="text-xl font-bold font-display mt-1">{value}</p>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-secondary">{label}</span>
      <span className="text-sm">{children}</span>
    </div>
  );
}
