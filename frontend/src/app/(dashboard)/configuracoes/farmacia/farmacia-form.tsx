"use client";

import { useActionState } from "react";
import { updatePharmacyAction, type PharmacyFormState } from "@/modules/settings/actions";
import type { Pharmacy } from "@/modules/settings/types";
import { UFS } from "@/lib/geo/uf";

const initialState: PharmacyFormState = {};

export function FarmaciaForm({ initial, canEdit }: { initial: Pharmacy; canEdit: boolean }) {
  const [state, formAction, pending] = useActionState(updatePharmacyAction, initialState);

  return (
    <section className="card-premium max-w-2xl p-6">
      <h2 className="mb-1 font-display text-subtitle font-semibold text-ink">Dados da farmácia</h2>
      <p className="mb-5 text-caption text-secondary">Informações cadastrais usadas em documentos e atribuição.</p>

      <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tradeName" className="label-premium">Nome fantasia</label>
          <input id="tradeName" name="tradeName" defaultValue={initial.tradeName} readOnly={!canEdit} required className="field-premium" />
        </div>
        <div>
          <label htmlFor="legalName" className="label-premium">Razão social</label>
          <input id="legalName" name="legalName" defaultValue={initial.legalName} readOnly={!canEdit} required className="field-premium" />
        </div>
        <div>
          <label htmlFor="cnpj" className="label-premium">CNPJ</label>
          <input id="cnpj" name="cnpj" defaultValue={initial.cnpj} placeholder="00.000.000/0000-00" readOnly={!canEdit} required className="field-premium" />
        </div>
        <div>
          <label htmlFor="timezone" className="label-premium">Fuso horário</label>
          <input id="timezone" name="timezone" defaultValue={initial.timezone} readOnly={!canEdit} required className="field-premium" />
        </div>
        <div>
          <label htmlFor="city" className="label-premium">Cidade (município)</label>
          <input id="city" name="city" defaultValue={initial.city ?? ""} placeholder="Ex.: São Paulo" readOnly={!canEdit} className="field-premium" />
        </div>
        <div>
          <label htmlFor="uf" className="label-premium">UF</label>
          <select id="uf" name="uf" defaultValue={initial.uf ?? ""} disabled={!canEdit} className="field-premium">
            <option value="">—</option>
            {UFS.map((u) => (
              <option key={u.code} value={u.code}>{u.code} — {u.name}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          {state.error ? <p role="alert" className="mb-3 text-small text-danger-text">{state.error}</p> : null}
          {state.ok ? <p className="mb-3 text-small text-success-text">Alterações salvas.</p> : null}
          {canEdit ? (
            <button type="submit" disabled={pending} className="btn-primary">
              {pending ? "Salvando…" : "Salvar alterações"}
            </button>
          ) : (
            <p className="text-caption text-muted">Você tem acesso somente de leitura a estes dados.</p>
          )}
        </div>
      </form>
    </section>
  );
}
