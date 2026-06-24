"use client";

import { useState, useTransition } from "react";
import { deleteUserAction } from "@/server/admin";

/* Exclui o usuário (a pessoa) com confirmação. Desabilitado p/ a própria conta. */
export function DeleteUserButton({
  userId,
  userName,
  isSelf,
}: {
  userId: string;
  userName: string;
  isSelf: boolean;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    if (isSelf) return;
    const ok = window.confirm(
      `Excluir o usuário "${userName}"?\n\nRemove TODOS os acessos dele e não pode ser desfeito.`,
    );
    if (!ok) return;
    setError(null);
    const fd = new FormData();
    fd.set("userId", userId);
    start(async () => {
      const r = await deleteUserAction(fd);
      if (r.error) setError(r.error);
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {error ? <span className="text-micro text-danger-text" title={error}>erro</span> : null}
      <button
        type="button"
        onClick={onClick}
        disabled={pending || isSelf}
        title={isSelf ? "Você não pode excluir a própria conta" : "Excluir usuário"}
        className="rounded-md border border-line px-2.5 py-1 text-micro font-medium text-danger-text transition-colors hover:border-danger-text/50 hover:bg-danger-bg disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? "Excluindo…" : "Excluir"}
      </button>
    </div>
  );
}
