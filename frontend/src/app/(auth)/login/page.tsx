import Link from "next/link";
import { LoginForm } from "./login-form";

/* Login premium — hero da marca (degradê + grid curvado) à esquerda, formulário
   em vidro sobre atmosfera à direita. */
export default function LoginPage() {
  return (
    <main className="relative grid min-h-screen flex-1 overflow-hidden lg:grid-cols-2">
      {/* Hero da marca */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-brand-600 p-12 text-white lg:flex">
        {/* Imagem das teclas Rx (Brand) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/mark-hero.jpg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        {/* Scrim — escurece p/ legibilidade do texto/logo, mantém o laranja da marca */}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-700/85 via-brand-600/45 to-brand-600/30" />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/25 via-transparent to-black/20" />

        <div className="relative flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/mark-white.svg" alt="Recepta" className="h-10 w-10" />
          <span className="font-display text-title font-semibold">Recepta <span className="font-normal text-white/70">Orbit</span></span>
        </div>

        <div className="relative max-w-md">
          <h2 className="font-display text-display-lg font-bold leading-tight">A receita certa para farmácias.</h2>
          <p className="mt-4 text-subtitle leading-relaxed text-white/85">
            Conversas do WhatsApp viram dados de venda, atribuição de campanha e clientes
            recorrentes — com previsibilidade, não promessas.
          </p>
        </div>

        <p className="relative text-caption text-white/70">Crescimento previsível para farmácias · Recepta</p>
      </section>

      {/* Formulário */}
      <section className="relative flex items-center justify-center p-6">
        <div className="atmosphere lg:hidden" aria-hidden>
          <span className="orb" />
          <span className="mesh" />
        </div>
        <div className="relative z-10 w-full max-w-sm animate-fade-in-up">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/mark-gradient.svg" alt="Recepta" className="h-9 w-9" />
            <span className="font-display text-title font-semibold tracking-tight text-ink">
              Recepta <span className="font-normal text-secondary">Orbit</span>
            </span>
          </div>

          <h1 className="font-display text-display font-bold text-ink">Entre na sua farmácia</h1>
          <p className="mb-8 mt-1.5 text-body text-neutral-600">Acesso criado pela equipe Recepta.</p>

          <LoginForm />

          <Link
            href="/recuperar-senha"
            className="mt-6 block text-center text-small text-neutral-600 transition-colors hover:text-brand-500"
          >
            Esqueci minha senha
          </Link>
        </div>
      </section>
    </main>
  );
}
