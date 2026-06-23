/* Placeholder "Em breve" para telas sem funcionalidade real na V1.
   NÃO renderiza mock-data — comunica honestamente que o recurso está por vir. */
export function EmBreve({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <div className="space-y-6">
      <header className="animate-fade-in">
        <h1 className="font-display text-display-lg font-bold tracking-tight text-ink">{titulo}</h1>
      </header>

      <div className="card-premium animate-fade-in-up flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <span className="inline-flex items-center rounded-full bg-info-bg px-3 py-1 text-caption font-semibold text-info-text">
          Em breve
        </span>
        <p className="max-w-md text-body text-secondary">{descricao}</p>
      </div>
    </div>
  );
}
