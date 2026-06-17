"use client";

import { useActionState } from "react";
import { inviteUserAction, type AdminFormState } from "@/server/admin";

const initialState: AdminFormState = {};
const field =
  "w-full h-10 rounded-lg border border-line bg-card px-3 text-body outline-none transition-shadow focus:border-brand-500 focus:shadow-focus";

export function InviteUserForm({ pharmacies }: { pharmacies: { id: string; tradeName: string }[] }) {
  const [state, formAction, pending] = useActionState(inviteUserAction, initialState);

  return (
    <form action={formAction} className="rounded-xl border border-line bg-card p-5 space-y-4">
      <h2 className="font-display font-semibold text-subtitle">Convidar usuário</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-small font-medium mb-1.5">
            Nome
          </label>
          <input id="name" name="name" required className={field} />
        </div>
        <div>
          <label htmlFor="email" className="block text-small font-medium mb-1.5">
            E-mail
          </label>
          <input id="email" name="email" type="email" required className={field} />
        </div>
        <div>
          <label htmlFor="pharmacyId" className="block text-small font-medium mb-1.5">
            Farmácia
          </label>
          <select id="pharmacyId" name="pharmacyId" required className={field} defaultValue="">
            <option value="" disabled>
              Selecione…
            </option>
            {pharmacies.map((p) => (
              <option key={p.id} value={p.id}>
                {p.tradeName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="role" className="block text-small font-medium mb-1.5">
            Papel
          </label>
          <select id="role" name="role" required className={field} defaultValue="VIEWER">
            <option value="MANAGER">Gerente</option>
            <option value="VIEWER">Visualizador</option>
          </select>
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="text-small text-danger-text">
          {state.error}
        </p>
      ) : null}

      {state.ok && state.inviteUrl ? (
        <div className="rounded-lg bg-muted p-3">
          <p className="text-small text-neutral-600 mb-1.5">
            Convite criado. Link de primeiro acesso (válido 7 dias) — anexe ao domínio do app:
          </p>
          <input
            readOnly
            value={state.inviteUrl}
            onFocus={(e) => e.currentTarget.select()}
            className={`${field} text-small`}
          />
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-10 px-4 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-semibold text-small
                   transition-colors disabled:opacity-60 disabled:pointer-events-none"
      >
        {pending ? "Convidando…" : "Convidar"}
      </button>
    </form>
  );
}
