"use client";

import { useActionState, useState } from "react";
import { completeInviteAction, type InviteState } from "@/server/auth/invite";

const initialState: InviteState = {};

function strength(pw: string): { pct: number; label: string; cls: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    { pct: 8, label: "—", cls: "bg-line" },
    { pct: 30, label: "Fraca", cls: "bg-danger-text" },
    { pct: 60, label: "Razoável", cls: "bg-warning-text" },
    { pct: 80, label: "Boa", cls: "bg-success-500" },
    { pct: 100, label: "Forte", cls: "bg-success-text" },
  ];
  return map[s];
}

export function InviteForm({
  token,
  name,
  pharmacyNames,
}: {
  token: string;
  name: string;
  pharmacyNames: string[];
}) {
  const [state, formAction, pending] = useActionState(completeInviteAction, initialState);
  const [pw, setPw] = useState("");
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const st = strength(pw);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <h1 className="font-display text-display font-bold text-ink">Bem-vindo, {name.split(" ")[0]}</h1>
        <p className="mt-1.5 text-body text-neutral-600">Defina sua senha para ativar o acesso.</p>
      </div>

      <input type="hidden" name="token" value={token} />

      {pharmacyNames.length > 0 && (
        <div>
          <span className="label-premium">{pharmacyNames.length > 1 ? "Farmácias" : "Farmácia"}</span>
          <div className="field-premium flex items-center bg-cream-alt/40 text-secondary">
            {pharmacyNames.join(", ")}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="password" className="label-premium">Nova senha</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="field-premium"
        />
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line-subtle">
            <div className={`h-full rounded-full transition-all duration-300 ${st.cls}`} style={{ width: `${st.pct}%` }} />
          </div>
          <span className="w-16 text-right text-micro text-muted">{st.label}</span>
        </div>
        <p className="mt-1.5 text-micro text-muted">Mínimo 8 caracteres, com letras e números.</p>
      </div>

      <div>
        <label htmlFor="confirm" className="label-premium">Confirmar senha</label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className="field-premium" />
      </div>

      <div className="space-y-2.5">
        <label className="flex items-start gap-2.5 text-small text-neutral-600">
          <input type="checkbox" name="acceptTerms" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 accent-brand-500" />
          <span>Li e aceito os <a href="#" className="text-brand-500 hover:underline">Termos de Uso</a>.</span>
        </label>
        <label className="flex items-start gap-2.5 text-small text-neutral-600">
          <input type="checkbox" name="acceptPrivacy" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} className="mt-0.5 accent-brand-500" />
          <span>Li e aceito a <a href="#" className="text-brand-500 hover:underline">Política de Privacidade</a>.</span>
        </label>
      </div>

      {state.error ? (
        <p role="alert" className="text-small text-danger-text">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending || !terms || !privacy || pw.length < 8}
        className="h-11 w-full rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 text-body font-semibold text-white shadow-[0_4px_16px_rgba(212,67,44,0.25)] transition-all hover:scale-[1.01] active:scale-[.99] disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? "Ativando…" : "Ativar acesso"}
      </button>
    </form>
  );
}
