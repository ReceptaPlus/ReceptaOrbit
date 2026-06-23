"use client";

import { useActionState, useState } from "react";
import { loginAction, type LoginState } from "@/server/auth/login";

const initialState: LoginState = {};

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-small font-medium text-ink">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="h-11 w-full rounded-lg border border-line bg-white/80 px-3.5 text-body outline-none backdrop-blur transition-shadow focus:border-brand-500 focus:shadow-focus"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-small font-medium text-ink">
          Senha
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="h-11 w-full rounded-lg border border-line bg-white/80 px-3.5 pr-11 text-body outline-none backdrop-blur transition-shadow focus:border-brand-500 focus:shadow-focus"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-neutral-400 transition-colors hover:text-ink-900"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 5c5.4 0 9.4 4.2 10.8 6.4a1.2 1.2 0 0 1 0 1.2C21.4 14.8 17.4 19 12 19S2.6 14.8 1.2 12.6a1.2 1.2 0 0 1 0-1.2C2.6 9.2 6.6 5 12 5Zm0 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
            </svg>
          </button>
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="text-small text-danger-text">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 text-body font-semibold text-white shadow-[0_4px_16px_rgba(212,67,44,0.25)] transition-all hover:scale-[1.01] active:scale-[.99] disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
