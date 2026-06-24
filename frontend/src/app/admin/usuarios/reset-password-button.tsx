"use client";

import { useState, useTransition } from "react";
import { resetUserPasswordAction } from "@/server/admin";

/* Redefine a senha do usuário e mostra a temporária UMA vez (com copiar).
   O admin repassa ao cliente; a senha não é recuperável depois. */
export function ResetPasswordButton({ userId, userName }: { userId: string; userName: string }) {
  const [pending, start] = useTransition();
  const [temp, setTemp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function onClick() {
    const ok = window.confirm(
      `Redefinir a senha de "${userName}"?\n\nGera uma senha temporária para você repassar ao cliente. A senha atual deixa de funcionar.`,
    );
    if (!ok) return;
    setError(null);
    setTemp(null);
    setCopied(false);
    const fd = new FormData();
    fd.set("userId", userId);
    start(async () => {
      const r = await resetUserPasswordAction(fd);
      if (r.error) setError(r.error);
      else if (r.tempPassword) setTemp(r.tempPassword);
    });
  }

  async function copy() {
    if (!temp) return;
    try {
      await navigator.clipboard.writeText(temp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponível — copia manual */
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="rounded-md border border-line px-2.5 py-1 text-micro font-medium text-secondary transition-colors hover:border-brand-400 hover:text-brand-500 disabled:opacity-40"
      >
        {pending ? "Redefinindo…" : "Redefinir senha"}
      </button>
      {error ? <span className="text-micro text-danger-text">{error}</span> : null}
      {temp ? (
        <div className="flex items-center gap-1.5 rounded-md border border-line-subtle bg-cream-alt/60 px-2 py-1">
          <span className="text-micro text-secondary">Senha:</span>
          <code className="text-micro font-semibold text-ink">{temp}</code>
          <button type="button" onClick={copy} className="text-micro text-brand-500 hover:underline">
            {copied ? "✓" : "copiar"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
