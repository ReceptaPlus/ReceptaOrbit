"use client";

import { useActionState, useState } from "react";
import { loginAction, type LoginState } from "@/server/auth/login";

const initialState: LoginState = {};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <main className="flex-1 grid lg:grid-cols-2 min-h-screen">
      {/* Hero — degradê do manual (brand-500 → brand-400) + grid curvado */}
      <section className="hidden lg:flex relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-brand-500 to-brand-400 text-white">
        <svg
          className="absolute inset-0 w-full h-full opacity-15 pointer-events-none"
          viewBox="0 0 600 800"
          fill="none"
          aria-hidden
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path
              key={i}
              d={`M-50 ${120 + i * 130} Q 300 ${40 + i * 130} 650 ${150 + i * 130}`}
              stroke="white"
              strokeWidth="1.5"
            />
          ))}
        </svg>

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <span className="font-display font-bold text-lg">R</span>
          </div>
          <span className="font-display font-semibold text-title">Recepta Orbit</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="font-display font-bold text-display-lg leading-tight">
            A receita certa para farmácias.
          </h2>
          <p className="mt-4 text-subtitle text-white/85 leading-relaxed">
            Conversas do WhatsApp viram dados de venda, atribuição de campanha e
            clientes recorrentes — com previsibilidade, não promessas.
          </p>
        </div>

        <p className="relative text-caption text-white/70">
          Crescimento previsível para farmácias · Recepta
        </p>
      </section>

      {/* Formulário */}
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center">
              <span className="text-white font-display font-bold">R</span>
            </div>
            <span className="font-display font-semibold text-title tracking-tight">Recepta Orbit</span>
          </div>

          <h1 className="font-display text-display font-bold">Entre na sua farmácia</h1>
          <p className="text-body text-neutral-600 mt-1.5 mb-8">
            Acesso criado pela equipe Recepta.
          </p>

          <form action={formAction} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-small font-medium mb-1.5">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                className="w-full h-11 rounded-lg border border-line bg-card px-3.5 text-body outline-none
                           transition-shadow focus:border-brand-500 focus:shadow-focus"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-small font-medium mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="w-full h-11 rounded-lg border border-line bg-card px-3.5 pr-11 text-body outline-none
                             transition-shadow focus:border-brand-500 focus:shadow-focus"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center
                             rounded-md text-neutral-400 hover:text-ink-900 transition-colors"
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
              className="w-full h-11 rounded-lg bg-brand-500 hover:bg-brand-600 active:scale-[.99]
                         text-white font-semibold text-body transition-all shadow-sm
                         disabled:opacity-60 disabled:pointer-events-none"
            >
              {pending ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <a
            href="/recuperar-senha"
            className="block text-center text-small text-neutral-600 hover:text-brand-500 mt-6 transition-colors"
          >
            Esqueci minha senha
          </a>
        </div>
      </section>
    </main>
  );
}
