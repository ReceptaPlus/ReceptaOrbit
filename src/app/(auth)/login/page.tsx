"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandBanner } from "@/components/brand/brand-banner";
import { Logo } from "@/components/brand/logo";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/dashboard");
  }

  return (
    <main className="flex-1 grid lg:grid-cols-2 min-h-screen">
      {/* Hero — banner institucional oficial (foto real + overlay + pattern + slogan) */}
      <section className="hidden lg:block relative p-3">
        <BrandBanner
          image="pharmacist"
          pattern="grid"
          title="A receita certa para farmácias."
          subtitle="Conversas do WhatsApp viram dados de venda, atribuição de campanha e clientes recorrentes — com previsibilidade, não promessas."
          className="h-full"
        >
          <div className="text-[#FFF5D9] mb-auto">
            <Logo variant="wordmark" size={28} />
          </div>
        </BrandBanner>
      </section>

      {/* Formulário */}
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 text-ink">
            <Logo variant="wordmark" size={28} />
          </div>

          <h1 className="font-display text-display font-bold">Entre na sua farmácia</h1>
          <p className="text-body text-secondary mt-1.5 mb-8">
            Acesso criado pela equipe Recepta.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-small font-medium mb-1.5">
                Usuário
              </label>
              <input
                id="username"
                type="text"
                defaultValue="antonio.ferreira"
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
                  type={showPassword ? "text" : "password"}
                  defaultValue="12345678"
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

            <button
              type="submit"
              className="w-full h-11 rounded-lg bg-brand-500 hover:bg-brand-600 active:scale-[.99]
                         text-white font-semibold text-body transition-all shadow-sm"
            >
              Entrar
            </button>
          </form>

          <a
            href="#"
            className="block text-center text-small text-neutral-600 hover:text-brand-500 mt-6 transition-colors"
          >
            Esqueci minha senha
          </a>
        </div>
      </section>
    </main>
  );
}
