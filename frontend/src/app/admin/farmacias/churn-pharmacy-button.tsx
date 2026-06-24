"use client";

import { useState, useTransition } from "react";
import { churnPharmacyAction } from "@/server/admin";

/* "Churn": exclui a farmácia e TODO o dado dela (cascade). Pede confirmação
   digitando o nome exato — guarda-corpo p/ ação irreversível. */
export function ChurnPharmacyButton({
  pharmacyId,
  tradeName,
}: {
  pharmacyId: string;
  tradeName: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    const typed = window.prompt(
      `CHURN — excluir a farmácia "${tradeName}".\n\n` +
        `Isto apaga TODAS as conversas, mensagens, contatos e acessos dela. ` +
        `Não pode ser desfeito.\n\n` +
        `Para confirmar, digite o nome da farmácia:`,
    );
    if (typed === null) return; // cancelou
    if (typed.trim() !== tradeName.trim()) {
      setError("Nome não confere");
      return;
    }
    setError(null);
    const fd = new FormData();
    fd.set("pharmacyId", pharmacyId);
    start(async () => {
      const r = await churnPharmacyAction(fd);
      if (r.error) setError(r.error);
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {error ? (
        <span className="text-micro text-danger-text" title={error}>
          {error}
        </span>
      ) : null}
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        title={`Churn — excluir ${tradeName} e todos os dados`}
        className="btn-churn"
      >
        {pending ? "Excluindo…" : "Churn"}
      </button>
    </div>
  );
}
