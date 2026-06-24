"use client";

/* Error boundary de rota. NÃO expõe stack/detalhes ao usuário — só uma mensagem
   genérica + opção de tentar de novo. O erro real fica no log do servidor. */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="font-display text-display font-bold text-ink">Algo deu errado</p>
      <p className="max-w-md text-body text-secondary">
        Tivemos um problema ao carregar esta página. Tente novamente; se persistir, fale com a equipe Recepta.
      </p>
      <button
        type="button"
        onClick={reset}
        className="btn-primary mt-2"
      >
        Tentar novamente
      </button>
    </main>
  );
}
