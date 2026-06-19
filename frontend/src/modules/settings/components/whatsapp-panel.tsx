"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { startPairingAction, syncStateAction, disconnectAction } from "../whatsapp-actions";
import type { WhatsAppStatusVM, WhatsAppState } from "../whatsapp";

const STATE_STYLE: Record<WhatsAppState, string> = {
  CONNECTED: "bg-success-bg text-success-text",
  PAIRING: "bg-warning-bg text-warning-text",
  DISCONNECTED: "bg-line-subtle text-secondary",
  DOWN: "bg-danger-bg text-danger-text",
};
const STATE_LABEL: Record<WhatsAppState, string> = {
  CONNECTED: "Conectado",
  PAIRING: "Pareando",
  DISCONNECTED: "Desconectado",
  DOWN: "Fora do ar",
};

export function WhatsAppPanel({ initial, canManage }: { initial: WhatsAppStatusVM; canManage: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<WhatsAppState>(initial.state);
  const [qr, setQr] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Poll do estado enquanto estiver pareando; para ao conectar.
  useEffect(() => {
    if (state !== "PAIRING") return;
    const id = setInterval(async () => {
      const r = await syncStateAction();
      if (r.state) {
        setState(r.state);
        if (r.state === "CONNECTED") {
          setQr(null);
          setPairingCode(null);
          router.refresh();
        }
      }
    }, 4000);
    return () => clearInterval(id);
  }, [state, router]);

  function onConnect() {
    setError(null);
    startTransition(async () => {
      const r = await startPairingAction();
      if (r.error) { setError(r.error); return; }
      setQr(r.qr ?? null);
      setPairingCode(r.pairingCode ?? null);
      setState("PAIRING");
    });
  }

  function onDisconnect() {
    startTransition(async () => {
      await disconnectAction();
      setState("DISCONNECTED");
      setQr(null);
      setPairingCode(null);
      router.refresh();
    });
  }

  return (
    <section className="bg-card rounded-xl border border-line p-5 space-y-4 max-w-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold font-display">Conexão WhatsApp</h2>
          {initial.pairedNumber && state === "CONNECTED" && (
            <p className="text-sm text-secondary mt-0.5">Número: {initial.pairedNumber}</p>
          )}
          {initial.sinceDisplay && (
            <p className="text-xs text-muted mt-0.5">Desde {initial.sinceDisplay}</p>
          )}
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATE_STYLE[state]}`}>
          {STATE_LABEL[state]}
        </span>
      </div>

      {error && <p role="alert" className="text-sm text-danger-text">{error}</p>}

      {/* QR / código de pareamento */}
      {state === "PAIRING" && (qr || pairingCode) && (
        <div className="rounded-lg border border-line-subtle p-4 space-y-3">
          <p className="text-sm font-medium">Escaneie no WhatsApp do aparelho</p>
          <p className="text-xs text-secondary">
            WhatsApp → Aparelhos conectados → Conectar um aparelho. O código expira em ~60s.
          </p>
          {qr && (
            <Image src={qr} alt="QR code de pareamento" width={240} height={240} unoptimized className="rounded-lg border border-line" />
          )}
          {pairingCode && (
            <p className="text-sm">
              Ou use o código: <span className="font-mono font-semibold tracking-wider">{pairingCode}</span>
            </p>
          )}
          <p className="text-xs text-muted md:hidden">Dica: abra esta tela no computador para escanear mais fácil.</p>
        </div>
      )}

      {/* Ações (só MANAGER+) */}
      {canManage ? (
        <div className="flex flex-wrap gap-2">
          {state === "CONNECTED" ? (
            <Button variant="outline" size="sm" onClick={onDisconnect} disabled={pending}>
              {pending ? "Processando…" : "Desconectar"}
            </Button>
          ) : (
            <Button size="sm" onClick={onConnect} disabled={pending}>
              {pending ? "Gerando QR…" : state === "PAIRING" ? "Gerar novo QR" : "Conectar"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => startTransition(async () => { const r = await syncStateAction(); if (r.state) setState(r.state); router.refresh(); })} disabled={pending}>
            Atualizar status
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted">Apenas gerentes podem parear ou desconectar.</p>
      )}
    </section>
  );
}
