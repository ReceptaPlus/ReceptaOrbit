import { Button } from "@/components/ui/button";
import { listIntegrationsVM } from "@/modules/settings/queries";

export default async function IntegracoesPage() {
  const integrations = await listIntegrationsVM();

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {integrations.map((i) => {
        const status = i.comingSoon ? "Em breve" : i.connected ? "Conectado" : "Desconectado";
        const statusStyle = i.connected
          ? "bg-success-bg text-success-text"
          : i.comingSoon
            ? "bg-info-bg text-info-text"
            : "bg-cream-alt text-muted";
        return (
          <div key={i.id} className="card-premium shine animate-fade-in-up flex flex-col p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="font-display text-subtitle font-semibold text-ink">{i.name}</p>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-micro font-semibold ${statusStyle}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${i.connected ? "bg-current pulse-dot" : "bg-current opacity-60"}`} />
                {status}
              </span>
            </div>
            <p className="mt-2 flex-1 text-caption text-secondary">{i.detail}</p>
            <Button
              size="sm"
              variant={i.connected ? "outline" : "default"}
              disabled={i.comingSoon}
              className="mt-4 self-start"
            >
              {i.comingSoon ? "Em breve" : i.connected ? "Desconectar" : "Conectar"}
            </Button>
          </div>
        );
      })}
    </section>
  );
}
