"use client";

/* Fallback global (erro no próprio root layout). Precisa renderizar <html>/<body>.
   Mensagem genérica — sem stack/detalhes ao usuário. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", margin: 0 }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Algo deu errado</h1>
          <p style={{ color: "#666", maxWidth: 420 }}>
            Tivemos um problema inesperado. Tente novamente; se persistir, fale com a equipe Recepta.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 12, padding: "8px 16px", borderRadius: 8, border: "1px solid #ccc", cursor: "pointer" }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
