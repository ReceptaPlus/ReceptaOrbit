import Link from "next/link";
import { requireCan } from "@/server/auth/dal";
import { logoutAction } from "@/server/auth/login";

const NAV = [
  { href: "/admin/farmacias", label: "Farmácias" },
  { href: "/admin/usuarios", label: "Usuários" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Área de plataforma — só PLATFORM_ADMIN/SUPPORT (requireCan redireciona os demais).
  await requireCan("access_admin");

  return (
    <div className="relative min-h-screen">
      <div className="atmosphere" aria-hidden>
        <span className="orb" />
        <span className="mesh" />
      </div>

      <header className="glass-strong sticky top-0 z-20 border-b border-line">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/mark-gradient.svg" alt="Recepta" className="h-8 w-8" />
              <div className="leading-tight">
                <p className="font-display text-subtitle font-bold text-ink">Recepta Orbit</p>
                <p className="text-micro font-medium uppercase tracking-[0.14em] text-brand-500">Admin · Plataforma</p>
              </div>
            </div>
            <nav className="hidden items-center gap-1 md:flex">
              {NAV.map((n) => (
                <Link
                  key={n.label}
                  href={n.href}
                  className="rounded-lg px-3 py-1.5 text-small font-medium text-secondary transition-colors hover:bg-cream-alt/60 hover:text-ink"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="hidden text-small text-secondary transition-colors hover:text-brand-500 sm:block">
              ← App
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="rounded-lg border border-line bg-white/70 px-3 py-1.5 text-small font-medium text-secondary transition-colors hover:border-brand-400 hover:text-brand-500">
                Sair
              </button>
            </form>
          </div>
        </div>

        {/* Nav mobile: abas sempre visíveis no topo (desktop usa a nav inline acima) */}
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-line px-6 py-2 md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-small font-medium text-secondary transition-colors hover:bg-cream-alt/60 hover:text-ink"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        <div className="animate-fade-in-up">{children}</div>
      </main>
    </div>
  );
}
