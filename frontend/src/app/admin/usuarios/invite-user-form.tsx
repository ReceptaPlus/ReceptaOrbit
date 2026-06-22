"use client";

import { useActionState } from "react";
import { inviteUserAction, type AdminFormState } from "@/server/admin";

const initialState: AdminFormState = {};

export function InviteUserForm({ pharmacies }: { pharmacies: { id: string; tradeName: string }[] }) {
  const [state, formAction, pending] = useActionState(inviteUserAction, initialState);

  return (
    <form action={formAction} className="card-premium space-y-4 p-6">
      <h2 className="font-display text-subtitle font-semibold text-ink">Convidar usuário</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label-premium">Nome</label>
          <input id="name" name="name" required className="field-premium" />
        </div>
        <div>
          <label htmlFor="email" className="label-premium">E-mail</label>
          <input id="email" name="email" type="email" required className="field-premium" />
        </div>
        <div>
          <label htmlFor="pharmacyId" className="label-premium">Farmácia</label>
          <select id="pharmacyId" name="pharmacyId" required className="field-premium" defaultValue="">
            <option value="" disabled>Selecione…</option>
            {pharmacies.map((p) => (
              <option key={p.id} value={p.id}>{p.tradeName}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="role" className="label-premium">Papel</label>
          <select id="role" name="role" required className="field-premium" defaultValue="VIEWER">
            <option value="MANAGER">Gerente</option>
            <option value="VIEWER">Visualizador</option>
          </select>
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="text-small text-danger-text">{state.error}</p>
      ) : null}

      {state.ok && state.inviteUrl ? (
        <div className="rounded-lg border border-line-subtle bg-cream-alt/50 p-3">
          <p className="mb-1.5 text-small text-secondary">
            Convite criado. Link de primeiro acesso (válido 7 dias) — anexe ao domínio do app:
          </p>
          <input
            readOnly
            value={state.inviteUrl}
            onFocus={(e) => e.currentTarget.select()}
            className="field-premium text-small"
          />
        </div>
      ) : null}

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Convidando…" : "Convidar"}
      </button>
    </form>
  );
}
