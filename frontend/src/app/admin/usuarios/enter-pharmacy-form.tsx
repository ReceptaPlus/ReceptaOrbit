"use client";

import { useActionState } from "react";
import { enterPharmacyAction } from "@/server/auth/impersonation";
import type { AdminFormState } from "@/server/admin";

const initialState: AdminFormState = {};

/* Painel de suporte: staff entra numa conta de farmácia (impersonação, acesso total).
   Sucesso → redirect p/ o dashboard do tenant; sair volta pelo banner no app. */
export function EnterPharmacyForm({ pharmacies }: { pharmacies: { id: string; tradeName: string }[] }) {
  const [state, formAction, pending] = useActionState(enterPharmacyAction, initialState);

  return (
    <form action={formAction} className="card-premium space-y-4 p-6">
      <div>
        <h2 className="font-display text-subtitle font-semibold text-ink">Acessar conta (suporte)</h2>
        <p className="mt-1 text-small text-secondary">
          Entra na conta da farmácia como suporte, com acesso total, para investigar e ajudar. Toda ação
          fica registrada em seu nome. Um aviso fica visível enquanto você estiver na conta.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="enter-pharmacyId" className="label-premium">Farmácia</label>
          <select id="enter-pharmacyId" name="pharmacyId" required className="field-premium" defaultValue="">
            <option value="" disabled>Selecione…</option>
            {pharmacies.map((p) => (
              <option key={p.id} value={p.id}>{p.tradeName}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={pending} className="btn-primary shrink-0 whitespace-nowrap">
          {pending ? "Acessando…" : "Acessar conta"}
        </button>
      </div>

      {state.error ? <p role="alert" className="text-small text-danger-text">{state.error}</p> : null}
    </form>
  );
}
