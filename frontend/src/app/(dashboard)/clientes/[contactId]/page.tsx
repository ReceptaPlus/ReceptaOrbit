import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerVM } from "@/modules/customers/queries";
import { StatusBadge } from "@/components/badges";
import { KpiCard } from "@/components/kpi-card";

export default async function ClienteFichaPage({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const { contactId } = await params;
  const contact = await getCustomerVM(contactId);
  if (!contact) notFound();

  const open = contact.cycles.filter((c) => c.status === "OPEN").length;
  const tag = contact.conversationCount >= 4 ? "VIP" : contact.conversationCount >= 2 ? "Ativo" : "Novo";
  const tagCls = tag === "VIP" ? "bg-brand-50 text-brand-600" : tag === "Ativo" ? "bg-success-bg text-success-text" : "bg-info-bg text-info-text";

  return (
    <div className="space-y-6">
      <header className="animate-fade-in">
        <Link href="/clientes" className="text-small text-secondary transition-colors hover:text-brand-500">
          ← Clientes
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-400 text-title font-semibold text-white shadow-[0_4px_16px_rgba(212,67,44,0.25)]">
            {contact.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-display font-bold tracking-tight text-ink">{contact.name}</h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-micro font-semibold ${tagCls}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                {tag}
              </span>
            </div>
            <p className="text-small text-secondary" data-numeric>{contact.phoneDisplay}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Conversas" value={String(contact.conversationCount)} hint="no total" accent index={0} />
        <KpiCard label="Abertas" value={String(open)} hint="em andamento" index={1} />
        <KpiCard label="Primeiro contato" value={contact.firstSeen} index={2} />
        <KpiCard label="Último contato" value={contact.lastSeen} index={3} />
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <section className="card-premium p-0">
          <div className="border-b border-line-subtle px-5 py-4">
            <h2 className="font-display text-subtitle font-semibold text-ink">Histórico de conversas</h2>
          </div>
          {contact.cycles.length === 0 ? (
            <p className="p-5 text-small text-secondary">Nenhum ciclo registrado.</p>
          ) : (
            <ul className="p-2">
              {contact.cycles.map((c, i) => (
                <li key={c.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                  <Link
                    href={`/conversas/${c.id}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-cream-alt/50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cream-alt text-brand-500">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" /></svg>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-small font-medium text-ink" data-numeric>{c.messageCount} mensage{c.messageCount === 1 ? "m" : "ns"}</p>
                      <p className="mt-0.5 text-caption text-muted">Última às {c.lastMessageTime}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card-premium space-y-3 p-5">
          <h2 className="font-display text-subtitle font-semibold text-ink">Dados do contato</h2>
          <Row label="Telefone"><span data-numeric>{contact.phoneDisplay}</span></Row>
          <Row label="Primeiro contato">{contact.firstSeen}</Row>
          <Row label="Última interação">{contact.lastSeen}</Row>
          <Row label="Conversas"><span data-numeric>{contact.conversationCount}</span></Row>
          {contact.notes && (
            <div className="border-t border-line-subtle pt-3">
              <p className="text-small text-secondary">Observações</p>
              <p className="mt-1 text-small text-ink">{contact.notes}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-small text-secondary">{label}</span>
      <span className="text-small font-medium text-ink">{children}</span>
    </div>
  );
}
