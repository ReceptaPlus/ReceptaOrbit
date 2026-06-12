import Link from "next/link";
import { notFound } from "next/navigation";
import {
  conversationCycles,
  sales,
  formatBRL,
  formatTime,
  METHOD_LABEL,
} from "@/lib/mock-data";
import {
  ConfidencePill,
  OutcomeBadge,
  SourceBadge,
  StageBadge,
  StatusBadge,
} from "@/components/badges";

export default async function ConversaDetalhePage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const cycle = conversationCycles.find((c) => c.id === conversationId);
  if (!cycle) notFound();

  const sale = sales.find((s) => s.conversationCycleId === cycle.id);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <Link href="/app/conversas" className="text-sm text-secondary hover:text-primary">
            ← Conversas
          </Link>
          <h1 className="text-2xl font-bold font-display mt-1">{cycle.contactName}</h1>
          <p className="text-sm text-secondary">{cycle.phone}</p>
        </div>
        <button className="rounded-lg border border-primary text-primary px-4 py-2 text-sm font-medium hover:bg-primary-light transition-colors">
          Corrigir classificação
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Timeline de mensagens */}
        <section className="lg:col-span-2 bg-card rounded-xl border border-line p-5">
          <h2 className="font-semibold font-display mb-4">Linha do tempo</h2>
          <div className="space-y-3">
            {cycle.messages.map((m) => (
              <div key={m.id} className={`flex ${m.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.direction === "OUTBOUND"
                      ? "bg-primary text-white rounded-br-md"
                      : "bg-subtle border border-line-subtle rounded-bl-md"
                  }`}
                >
                  <p>{m.textContent}</p>
                  <p className={`text-[10px] mt-1 ${m.direction === "OUTBOUND" ? "text-white/70" : "text-muted"}`}>
                    {formatTime(m.sentAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Painel lateral */}
        <div className="space-y-4">
          <section className="bg-card rounded-xl border border-line p-5 space-y-3">
            <h2 className="font-semibold font-display">Classificação</h2>
            <Row label="Etapa"><StageBadge stage={cycle.stage} /></Row>
            <Row label="Status"><StatusBadge status={cycle.status} /></Row>
            <Row label="Resultado"><OutcomeBadge outcome={cycle.outcome} /></Row>
            <Row label="Valor estimado">
              <span className="font-medium">
                {cycle.estimatedValueCents != null ? formatBRL(cycle.estimatedValueCents) : "—"}
              </span>
            </Row>
            <Row label="Confiança da IA"><ConfidencePill value={cycle.aiConfidence} /></Row>
          </section>

          <section className="bg-card rounded-xl border border-line p-5 space-y-3">
            <h2 className="font-semibold font-display">Origem e evidências</h2>
            <Row label="Origem"><SourceBadge source={cycle.attribution.source} /></Row>
            <Row label="Método">
              <span className="text-sm">{METHOD_LABEL[cycle.attribution.method]}</span>
            </Row>
            <Row label="Confiança"><ConfidencePill value={cycle.attribution.confidence} /></Row>
            {cycle.attribution.campaignName && (
              <Row label="Campanha"><span className="text-sm">{cycle.attribution.campaignName}</span></Row>
            )}
          </section>

          <section className="bg-card rounded-xl border border-line p-5">
            <h2 className="font-semibold font-display mb-2">Resumo da IA</h2>
            <p className="text-sm text-secondary leading-relaxed">{cycle.aiSummary}</p>
          </section>

          {sale && (
            <section className="bg-card rounded-xl border border-line p-5">
              <h2 className="font-semibold font-display mb-3">Venda associada</h2>
              <Link href="/app/vendas" className="block rounded-lg border border-line-subtle p-3 hover:border-primary transition-colors">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{sale.id.toUpperCase()}</span>
                  <span className="font-bold font-display">{formatBRL(sale.netAmountCents)}</span>
                </div>
                <ul className="mt-2 space-y-1">
                  {sale.items.map((i) => (
                    <li key={i.productName} className="text-xs text-secondary">
                      {i.quantity}× {i.productName} — {formatBRL(i.totalPriceCents)}
                    </li>
                  ))}
                </ul>
              </Link>
            </section>
          )}
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
