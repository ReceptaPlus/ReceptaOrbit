"use client";

import { useState, useTransition } from "react";
import { setPharmacyAdsClientAction } from "@/server/admin";

/* Seletor por linha: vincula a farmácia a um Client do Agente-Meta-Ads.
   Salva na hora (server action) ao mudar. Vazio = desvincula. */
export function AdsClientSelect({
  pharmacyId,
  current,
  clients,
}: {
  pharmacyId: string;
  current: string | null;
  clients: { id: string; name: string }[];
}) {
  const [value, setValue] = useState(current ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setValue(next);
    setSaved(false);
    setError(null);
    const fd = new FormData();
    fd.set("pharmacyId", pharmacyId);
    fd.set("agenteClientId", next);
    start(async () => {
      const r = await setPharmacyAdsClientAction(fd);
      if (r.error) setError(r.error);
      else setSaved(true);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        onChange={onChange}
        disabled={pending || clients.length === 0}
        className="field-premium max-w-[14rem] py-1.5 text-small"
      >
        <option value="">{clients.length === 0 ? "— Agente indisponível —" : "— não vinculado —"}</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      {pending ? (
        <span className="text-micro text-muted">salvando…</span>
      ) : error ? (
        <span className="text-micro text-danger-text" title={error}>
          erro
        </span>
      ) : saved ? (
        <span className="text-micro text-success-text">✓ salvo</span>
      ) : null}
    </div>
  );
}
