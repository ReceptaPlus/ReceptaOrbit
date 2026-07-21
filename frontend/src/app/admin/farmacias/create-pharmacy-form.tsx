"use client";

import { useActionState } from "react";
import { createPharmacyAction, type AdminFormState } from "@/server/admin";
import { UFS } from "@/lib/geo/uf";

const initialState: AdminFormState = {};

export function CreatePharmacyForm() {
  const [state, formAction, pending] = useActionState(createPharmacyAction, initialState);

  return (
    <form action={formAction} className="card-premium space-y-4 p-6">
      <h2 className="font-display text-subtitle font-semibold text-ink">Nova farmácia</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tradeName" className="label-premium">Nome fantasia</label>
          <input id="tradeName" name="tradeName" required className="field-premium" />
        </div>
        <div>
          <label htmlFor="legalName" className="label-premium">Razão social</label>
          <input id="legalName" name="legalName" required className="field-premium" />
        </div>
        <div>
          <label htmlFor="cnpj" className="label-premium">CNPJ</label>
          <input id="cnpj" name="cnpj" placeholder="00.000.000/0000-00" required className="field-premium" />
        </div>
        <div>
          <label htmlFor="city" className="label-premium">Cidade (município)</label>
          <input id="city" name="city" placeholder="Ex.: São Paulo" required className="field-premium" />
        </div>
        <div>
          <label htmlFor="uf" className="label-premium">UF</label>
          <select id="uf" name="uf" required defaultValue="" className="field-premium">
            <option value="" disabled>Selecione…</option>
            {UFS.map((u) => (
              <option key={u.code} value={u.code}>{u.code} — {u.name}</option>
            ))}
          </select>
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="text-small text-danger-text">{state.error}</p>
      ) : null}
      {state.ok ? <p className="text-small text-success-text">Farmácia criada.</p> : null}

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Criando…" : "Criar farmácia"}
      </button>
    </form>
  );
}
