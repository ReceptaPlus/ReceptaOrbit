import Link from "next/link";
import { contacts, formatBRL, formatDate } from "@/lib/mock-data";
import { SourceBadge } from "@/components/badges";

export default function ClientesPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Clientes</h1>
          <p className="text-sm text-secondary mt-1">
            Contatos consolidados por telefone (E.164). {contacts.length} clientes.
          </p>
        </div>
        <input
          type="search"
          placeholder="Buscar por nome ou telefone…"
          className="rounded-lg border border-line bg-card px-3.5 py-2 text-sm w-64 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </header>

      <div className="bg-card rounded-xl border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-secondary border-b border-line">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Telefone</th>
              <th className="px-4 py-3 font-medium">Primeiro contato</th>
              <th className="px-4 py-3 font-medium">Último contato</th>
              <th className="px-4 py-3 font-medium text-right">Conversas</th>
              <th className="px-4 py-3 font-medium text-right">Compras</th>
              <th className="px-4 py-3 font-medium text-right">Total comprado</th>
              <th className="px-4 py-3 font-medium text-right">Ticket médio</th>
              <th className="px-4 py-3 font-medium">Origens</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-subtle">
            {contacts.map((c) => (
              <tr key={c.id} className="hover:bg-subtle">
                <td className="px-4 py-3">
                  <Link href={`/app/clientes/${c.id}`} className="font-medium hover:text-primary">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-secondary">{c.phoneMasked}</td>
                <td className="px-4 py-3 text-secondary">{formatDate(c.firstSeenAt)}</td>
                <td className="px-4 py-3 text-secondary">{formatDate(c.lastSeenAt)}</td>
                <td className="px-4 py-3 text-right">{c.conversationCount}</td>
                <td className="px-4 py-3 text-right">{c.purchaseCount}</td>
                <td className="px-4 py-3 text-right font-medium">{formatBRL(c.totalSpentCents)}</td>
                <td className="px-4 py-3 text-right text-secondary">
                  {c.purchaseCount > 0 ? formatBRL(Math.round(c.totalSpentCents / c.purchaseCount)) : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {c.recurrentSources.map((s) => <SourceBadge key={s} source={s} />)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
