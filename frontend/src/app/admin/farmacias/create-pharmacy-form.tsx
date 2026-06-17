"use client";

import { useActionState } from "react";
import { createPharmacyAction, type AdminFormState } from "@/server/admin";

const initialState: AdminFormState = {};
const field =
  "w-full h-10 rounded-lg border border-line bg-card px-3 text-body outline-none transition-shadow focus:border-brand-500 focus:shadow-focus";

export function CreatePharmacyForm() {
  const [state, formAction, pending] = useActionState(createPharmacyAction, initialState);

  return (
    <form action={formAction} className="rounded-xl border border-line bg-card p-5 space-y-4">
      <h2 className="font-display font-semibold text-subtitle">Nova farmácia</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tradeName" className="block text-small font-medium mb-1.5">
            Nome fantasia
          </label>
          <input id="tradeName" name="tradeName" required className={field} />
        </div>
        <div>
          <label htmlFor="legalName" className="block text-small font-medium mb-1.5">
            Razão social
          </label>
          <input id="legalName" name="legalName" required className={field} />
        </div>
        <div>
          <label htmlFor="cnpj" className="block text-small font-medium mb-1.5">
            CNPJ
          </label>
          <input id="cnpj" name="cnpj" placeholder="00.000.000/0000-00" required className={field} />
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="text-small text-danger-text">
          {state.error}
        </p>
      ) : null}
      {state.ok ? <p className="text-small text-success-text">Farmácia criada.</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="h-10 px-4 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-semibold text-small
                   transition-colors disabled:opacity-60 disabled:pointer-events-none"
      >
        {pending ? "Criando…" : "Criar farmácia"}
      </button>
    </form>
  );
}
