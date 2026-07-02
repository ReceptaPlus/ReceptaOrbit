"use client";

import { useActionState, useState, useTransition } from "react";
import {
  connectDigisacAction,
  disconnectChannelAction,
  type AdminFormState,
} from "@/server/admin";

type Conn = { id: string; externalId: string; label: string | null; active: boolean };

const initial: AdminFormState = {};

/* Gestão de canal por farmácia. Sem conexão → usa Evolution (WhatsApp/QR).
   Com conexão Digisac → ingere pela Digisac. Conectar gera o segredo do webhook
   (mostrado UMA vez) + a URL pra colar no painel Digisac do cliente. */
export function ChannelConnect({
  pharmacyId,
  tradeName,
  connections,
}: {
  pharmacyId: string;
  tradeName: string;
  connections: Conn[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(connectDigisacAction, initial);

  return (
    <div className="flex flex-col gap-1.5">
      {connections.length === 0 ? (
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-cream-alt px-2.5 py-0.5 text-micro font-medium text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
          Evolution (WhatsApp)
        </span>
      ) : (
        connections.map((c) => <ConnRow key={c.id} conn={c} />)
      )}

      {!open && !state.ok ? (
        <button type="button" onClick={() => setOpen(true)} className="btn-sm w-fit">
          + Conectar Digisac
        </button>
      ) : null}

      {open && !state.ok ? (
        <form action={formAction} className="mt-1 w-[18rem] space-y-2 rounded-lg border border-line-subtle bg-cream-alt/40 p-3">
          <input type="hidden" name="pharmacyId" value={pharmacyId} />
          <p className="text-micro font-semibold text-ink">Conectar Digisac — {tradeName}</p>
          <div>
            <label className="text-micro text-secondary">ID do canal (serviceId) *</label>
            <input name="externalId" required placeholder="uuid do service na Digisac" className="field-premium py-1.5 text-small" />
          </div>
          <div>
            <label className="text-micro text-secondary">Apelido do canal</label>
            <input name="label" placeholder="ex.: WhatsApp Loja Centro" className="field-premium py-1.5 text-small" />
          </div>
          <div>
            <label className="text-micro text-secondary">URL da API (opcional)</label>
            <input name="apiBaseUrl" placeholder="https://conta.digisac.me/api/v1" className="field-premium py-1.5 text-small" />
          </div>
          {state.error ? <p className="text-micro text-danger-text">{state.error}</p> : null}
          <div className="flex items-center gap-2">
            <button type="submit" disabled={pending} className="btn-sm btn-sm-strong">
              {pending ? "Conectando…" : "Conectar"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="btn-sm">
              Cancelar
            </button>
          </div>
        </form>
      ) : null}

      {state.ok && state.webhookUrl ? (
        <WebhookResult url={state.webhookUrl} secret={state.webhookSecret ?? ""} />
      ) : null}
    </div>
  );
}

function ConnRow({ conn }: { conn: Conn }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function disconnect() {
    if (!window.confirm(`Desconectar o canal Digisac "${conn.label ?? conn.externalId}"?\n\nA farmácia para de receber por este canal. Dados já recebidos permanecem.`)) return;
    setError(null);
    const fd = new FormData();
    fd.set("connectionId", conn.id);
    start(async () => {
      const r = await disconnectChannelAction(fd);
      if (r.error) setError(r.error);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-info-bg px-2.5 py-0.5 text-micro font-medium text-info-text">
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
        Digisac · {conn.label ?? conn.externalId}
      </span>
      <button type="button" onClick={disconnect} disabled={pending} className="text-micro text-danger-text hover:underline disabled:opacity-40">
        {pending ? "…" : "desconectar"}
      </button>
      {error ? <span className="text-micro text-danger-text">{error}</span> : null}
    </div>
  );
}

/* Mostra a URL + segredo do webhook UMA vez (segredo não é recuperável depois). */
function WebhookResult({ url, secret }: { url: string; secret: string }) {
  return (
    <div className="mt-1 w-[20rem] space-y-2 rounded-lg border border-success-text/30 bg-success-bg/40 p-3">
      <p className="text-micro font-semibold text-ink">Canal conectado. Configure no painel da Digisac:</p>
      <CopyField label="URL do webhook" value={url} />
      <CopyField label="Header x-webhook-secret" value={secret} />
      <p className="text-micro text-secondary">
        Aponte o webhook da Digisac para a URL acima e envie o segredo no header
        <code className="mx-1 rounded bg-cream-alt px-1">x-webhook-secret</code>. O segredo
        <strong> não aparece de novo</strong> — copie agora.
      </p>
    </div>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponível */
    }
  }
  return (
    <div>
      <span className="text-micro text-secondary">{label}</span>
      <div className="flex items-center gap-1.5 rounded-md border border-line-subtle bg-white px-2 py-1">
        <code className="flex-1 truncate text-micro text-ink" title={value}>{value}</code>
        <button type="button" onClick={copy} className="text-micro text-brand-500 hover:underline">
          {copied ? "✓" : "copiar"}
        </button>
      </div>
    </div>
  );
}
