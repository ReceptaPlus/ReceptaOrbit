import Link from "next/link";
import { notFound } from "next/navigation";
import {
  contacts,
  conversationCycles,
  sales,
  formatBRL,
  formatDate,
  formatTime,
} from "@/lib/mock-data";
import { SaleStatusBadge, SourceBadge, StageBadge } from "@/components/badges";

export default async function ClienteFichaPage({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const { contactId } = await params;
  const contact = contacts.find((c) => c.id === contactId);
  if (!contact) notFound();

  const cycles = conversationCycles.filter((c) => c.contactId === contact.id);
  const contactSales = sales.filter((s) => s.contactId === contact.id);

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
            <p className="text-sm text-secondary">{contact.phoneMasked}</p>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Kpi label="Total acumulado" value={formatBRL(contact.totalSpentCents)} />
        <Kpi
          label="Ticket médio"
          value={contact.purchaseCount > 0 ? formatBRL(Math.round(contact.totalSpentCents / contact.purchaseCount)) : "—"}
        />
        <Kpi label="Conversas" value={String(contact.conversationCount)} />
        <Kpi label="Compras" value={String(contact.purchaseCount)} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <section className="bg-card rounded-xl border border-line p-5">
          <h2 className="font-semibold font-display mb-4">Histórico de conversas</h2>
          {cycles.length === 0 ? (
            <p className="text-sm text-secondary">Nenhum ciclo registrado neste período.</p>
          ) : (
            <ul className="divide-y divide-line-subtle">
              {cycles.map((c) => (
                <li key={c.id}>
                  <Link href={`/conversas/${c.id}`} className="flex items-center gap-3 py-3 hover:bg-subtle -mx-2 px-2 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.aiSummary}</p>
                      <p className="text-xs text-muted mt-0.5">
                        {formatDate(c.startedAt)} · {formatTime(c.lastMessageAt)}
                      </p>
                    </div>
                    <StageBadge stage={c.stage} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-4">
          <section className="bg-card rounded-xl border border-line p-5">
            <h2 className="font-semibold font-display mb-4">Histórico de compras</h2>
            {contactSales.length === 0 ? (
              <p className="text-sm text-secondary">Nenhuma compra registrada.</p>
            ) : (
              <ul className="divide-y divide-line-subtle">
                {contactSales.map((s) => (
                  <li key={s.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {s.items.map((i) => `${i.quantity}× ${i.productName}`).join(", ")}
                      </p>
                      <p className="text-xs text-muted mt-0.5">{formatDate(s.soldAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <SaleStatusBadge status={s.status} />
                      <span className="font-medium text-sm">{formatBRL(s.netAmountCents)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-card rounded-xl border border-line p-5 space-y-3">
            <h2 className="font-semibold font-display">Dados do contato</h2>
            <Row label="Telefone (E.164)">{contact.phoneE164}</Row>
            <Row label="Primeiro contato">{formatDate(contact.firstSeenAt)}</Row>
            <Row label="Última interação">{formatDate(contact.lastSeenAt)}</Row>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-secondary">Origens recorrentes</span>
              <div className="flex gap-1 flex-wrap justify-end">
                {contact.recurrentSources.map((s) => <SourceBadge key={s} source={s} />)}
              </div>
            </div>
            {contact.notes && (
              <div className="pt-2 border-t border-line-subtle">
                <p className="text-sm text-secondary">Observações</p>
                <p className="text-sm mt-1">{contact.notes}</p>
              </div>
            )}
          </section>
        </div>
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
