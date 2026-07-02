import { listCustomersVM, getCustomersKpis } from "@/modules/customers/queries";
import { KpiCard } from "@/components/kpi-card";
import { ClientesTable } from "./clientes-table";

export default async function ClientesPage() {
  const [contacts, kpis] = await Promise.all([listCustomersVM(), getCustomersKpis()]);

  const KPIS = [
    { label: "Clientes", value: String(kpis.total), hint: "base total", accent: true },
    { label: "Novos no mês", value: String(kpis.novosMes), hint: "1º contato no mês" },
    { label: "Novos (7d)", value: String(kpis.novos7d), hint: "últimos 7 dias" },
    { label: "Com conversa", value: String(kpis.comConversa), hint: "ao menos 1 ciclo", accent: true },
  ];

  return (
    <div className="space-y-6">
      <header className="animate-fade-in">
        <h1 className="font-display text-display-lg font-bold tracking-tight text-ink">Clientes</h1>
        <p className="mt-1 text-body text-secondary">
          Base consolidada por telefone — primeiro contato, recência e volume de conversas.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPIS.map((k, i) => (
          <KpiCard key={k.label} {...k} index={i} />
        ))}
      </div>

      <ClientesTable rows={contacts} />
    </div>
  );
}
