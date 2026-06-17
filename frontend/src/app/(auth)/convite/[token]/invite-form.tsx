"use client";

import { useActionState } from "react";
import { completeInviteAction, type InviteState } from "@/server/auth/invite";

const initialState: InviteState = {};

export function InviteForm({ token, name }: { token: string; name: string }) {
  const [state, formAction, pending] = useActionState(completeInviteAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <h1 className="font-display text-display font-bold">Bem-vindo, {name.split(" ")[0]}</h1>
        <p className="text-body text-neutral-600 mt-1.5">Defina sua senha para ativar o acesso.</p>
      </div>

      <input type="hidden" name="token" value={token} />

      <div>
        <label htmlFor="password" className="block text-small font-medium mb-1.5">
          Nova senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="w-full h-11 rounded-lg border border-line bg-card px-3.5 text-body outline-none
                     transition-shadow focus:border-brand-500 focus:shadow-focus"
        />
      </div>

      <div>
        <label htmlFor="confirm" className="block text-small font-medium mb-1.5">
          Confirmar senha
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          className="w-full h-11 rounded-lg border border-line bg-card px-3.5 text-body outline-none
                     transition-shadow focus:border-brand-500 focus:shadow-focus"
        />
      </div>

      <label className="flex items-start gap-2 text-small text-neutral-600">
        <input type="checkbox" name="acceptTerms" className="mt-0.5" />
        <span>Li e aceito os Termos de Uso e a Política de Privacidade.</span>
      </label>

      {state.error ? (
        <p role="alert" className="text-small text-danger-text">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full h-11 rounded-lg bg-brand-500 hover:bg-brand-600 active:scale-[.99]
                   text-white font-semibold text-body transition-all shadow-sm
                   disabled:opacity-60 disabled:pointer-events-none"
      >
        {pending ? "Ativando…" : "Ativar acesso"}
      </button>
    </form>
  );
}
