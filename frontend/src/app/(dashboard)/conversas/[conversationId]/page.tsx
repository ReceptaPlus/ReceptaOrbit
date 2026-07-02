import Link from "next/link";
import { notFound } from "next/navigation";
import { getConversationVM } from "@/modules/conversations/queries";
import { MarkConversationRead } from "@/components/mark-conversation-read";
import { StatusBadge, ConfidencePill } from "@/components/badges";
import { WaitingBadge } from "@/components/waiting-badge";

const SOURCE_LABEL: Record<string, string> = {
  META_ADS: "Meta Ads",
  GOOGLE_ADS: "Google Ads",
  INSTAGRAM_ORGANIC: "Instagram (orgânico)",
  WHATSAPP_ORGANIC: "WhatsApp (orgânico)",
  DIRECT: "Direto",
  UNKNOWN: "Desconhecida",
};
const METHOD_LABEL: Record<string, string> = {
  PROVIDER_REFERRAL: "Referral do provedor",
  CLICK_IDENTIFIER: "Identificador de clique",
  TRACKING_TOKEN: "Token de rastreio",
  AI_INFERENCE: "Inferência da IA",
  MANUAL: "Manual",
  UTM: "UTM",
};

export default async function ConversaDetalhePage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const cycle = await getConversationVM(conversationId);
  if (!cycle) notFound();

  const at = cycle.attribution;
  const conf = at ? Math.round(at.confidence * 100) : null;
  const confTone = conf == null ? "" : conf >= 85 ? "text-success-text" : conf >= 60 ? "text-warning-text" : "text-danger-text";

  return (
    <div className="space-y-6">
      <MarkConversationRead cycleId={cycle.id} />
      <header className="animate-fade-in">
        <Link href="/conversas" className="text-small text-secondary transition-colors hover:text-brand-500">
          ← Conversas
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/90 to-brand-400 font-semibold text-white">
            {cycle.contactName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-display font-bold tracking-tight text-ink">{cycle.contactName}</h1>
            <p className="text-small text-secondary" data-numeric>{cycle.phoneDisplay}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <StatusBadge status={cycle.status} />
            {cycle.waiting ? <WaitingBadge waiting={cycle.waiting} /> : null}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        {/* Timeline estilo WhatsApp */}
        <section className="card-premium lg:col-span-2 p-0">
          <div className="flex items-center justify-between border-b border-line-subtle px-5 py-4">
            <h2 className="font-display text-subtitle font-semibold text-ink">Conversa</h2>
            <span className="text-caption text-muted">{cycle.messages.length} mensagens · ciclo 24h</span>
          </div>
          <div
            className="space-y-3 p-5"
            role="log"
            style={{ background: "radial-gradient(120% 80% at 50% 0%, rgba(241,235,224,0.5), transparent 60%)" }}
          >
            {cycle.messages.length === 0 ? (
              <p className="text-small text-secondary">Sem mensagens neste ciclo.</p>
            ) : (
              cycle.messages.map((m, i) => {
                const out = m.direction === "OUTBOUND";
                return (
                  <div
                    key={m.id}
                    className={`flex animate-fade-in-up ${out ? "justify-end" : "justify-start"}`}
                    style={{ animationDelay: `${Math.min(i, 10) * 35}ms` }}
                  >
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-body shadow-sm ${
                        out
                          ? "rounded-br-md bg-gradient-to-br from-brand-500 to-brand-600 text-white"
                          : "rounded-bl-md border border-line-subtle bg-white text-ink"
                      }`}
                    >
                      <span className="sr-only">{out ? "Farmácia: " : "Cliente: "}</span>
                      <p>{m.text}</p>
                      <p className={`mt-1 text-[10px] ${out ? "text-white/70" : "text-muted"}`} data-numeric>{m.time}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Painel lateral */}
        <div className="space-y-4">
          {/* Análise da conversa (IA via n8n): venda + resumo */}
          {cycle.analysis ? (
            <section className="card-premium p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="font-display text-subtitle font-semibold text-ink">Análise da conversa</h2>
                {cycle.analysis.isSale ? (
                  <span className="inline-flex items-center rounded-full bg-success-bg px-2.5 py-0.5 text-xs font-medium text-success-text">
                    Venda identificada
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-line-subtle px-2.5 py-0.5 text-xs font-medium text-secondary">
                    Sem venda
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {cycle.analysis.isSale && cycle.analysis.valueDisplay ? (
                  <Row label="Valor"><span className="text-small font-semibold text-ink" data-numeric>{cycle.analysis.valueDisplay}</span></Row>
                ) : null}
                {cycle.analysis.stage ? <Row label="Estágio"><span className="text-small text-secondary">{cycle.analysis.stage}</span></Row> : null}
                {!cycle.analysis.isSale && cycle.analysis.lossReason ? (
                  <Row label="Motivo"><span className="text-small text-secondary">{cycle.analysis.lossReason}</span></Row>
                ) : null}
                <Row label="Confiança"><ConfidencePill value={cycle.analysis.confidence} /></Row>
                <div>
                  <span className="text-small text-secondary">Resumo</span>
                  <p className="mt-1 text-small leading-relaxed text-ink">{cycle.analysis.summary}</p>
                </div>
              </div>
            </section>
          ) : null}

          {/* Resumo da IA / Origem */}
          <section className="card-premium p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15l-1.9-4.1L5.5 9l4.6-1.4L12 3Z" /></svg>
              </span>
              <h2 className="font-display text-subtitle font-semibold text-ink">Resumo da IA</h2>
            </div>
            {at ? (
              <div className="space-y-3">
                <Row label="Origem">
                  <span className="rounded-md bg-cream-alt px-2 py-0.5 text-micro font-semibold text-ink">
                    {SOURCE_LABEL[at.source] ?? at.source}
                  </span>
                </Row>
                {at.campaignName ? <Row label="Campanha"><span className="text-small text-ink">{at.campaignName}</span></Row> : null}
                <Row label="Método"><span className="text-small text-secondary">{METHOD_LABEL[at.method] ?? at.method}</span></Row>
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-small text-secondary">Confiança</span>
                    <span className={`text-small font-semibold ${confTone}`} data-numeric>{conf}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-line-subtle">
                    <div className={`h-full rounded-full ${conf! >= 85 ? "bg-success-500" : conf! >= 60 ? "bg-warning-text" : "bg-danger-text"}`} style={{ width: `${conf}%` }} />
                  </div>
                  {conf! < 85 && (
                    <p className="mt-2 rounded-md bg-warning-bg px-2 py-1 text-micro text-warning-text">
                      Abaixo do limiar — sujeito a revisão manual.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-small text-secondary">Sem classificação de origem neste ciclo.</p>
            )}
          </section>

          {/* Situação */}
          <section className="card-premium space-y-3 p-5">
            <h2 className="font-display text-subtitle font-semibold text-ink">Situação</h2>
            <Row label="Status"><StatusBadge status={cycle.status} /></Row>
            <Row label="Aguardando">
              {cycle.waiting ? <WaitingBadge waiting={cycle.waiting} /> : <span className="text-small text-secondary">—</span>}
            </Row>
            <Row label="Mensagens"><span className="text-small font-semibold text-ink" data-numeric>{cycle.messages.length}</span></Row>
          </section>

          {/* Contato */}
          <section className="card-premium p-5">
            <h2 className="mb-2 font-display text-subtitle font-semibold text-ink">Contato</h2>
            <Link href={`/clientes/${cycle.contactId}`} className="text-small font-medium text-brand-500 hover:underline">
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
      <span className="text-small text-secondary">{label}</span>
      {children}
    </div>
  );
}
