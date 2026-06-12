import { Button } from "@/components/ui/button";
import { listIntegrations } from "@/modules/settings/api";

export default function IntegracoesPage() {
  const integrations = listIntegrations();

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {integrations.map((i) => (
        <div key={i.id} className="bg-card rounded-xl border border-line p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-sm">{i.name}</p>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              i.connected ? "bg-success-bg text-success-text" : "bg-line-subtle text-secondary"
            }`}>
              {i.connected ? "Conectado" : "Desconectado"}
            </span>
          </div>
          <p className="text-xs text-secondary mt-2">{i.detail}</p>
          <Button
            size="sm"
            variant={i.connected ? "outline" : "default"}
            className="mt-3"
          >
            {i.connected ? "Desconectar" : "Conectar"}
          </Button>
        </div>
      ))}
    </section>
  );
}
