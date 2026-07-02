"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/configuracoes/farmacia", label: "Farmácia", icon: "M3 21h18M5 21V7l7-4 7 4v14M9 9h2m-2 4h2m4-4h2m-2 4h2" },
  { href: "/configuracoes/usuarios", label: "Usuários", icon: "M16 19a4 4 0 0 0-8 0M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" },
  { href: "/configuracoes/whatsapp", label: "WhatsApp", icon: "M4 20l1.5-4A8 8 0 1 1 9 19.5L4 20Z" },
];

export default function ConfiguracoesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <header className="animate-fade-in">
        <h1 className="font-display text-display-lg font-bold tracking-tight text-ink">Configurações</h1>
        <p className="mt-1 text-body text-secondary">Dados da farmácia, equipe e conexão do WhatsApp.</p>
      </header>

      <nav
        className="card-premium animate-fade-in flex flex-wrap gap-1 p-1.5"
        aria-label="Seções de configuração"
      >
        {TABS.map((t) => {
          const active = pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-small font-medium transition-all",
                active
                  ? "bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-[0_2px_8px_rgba(212,67,44,0.25)]"
                  : "text-secondary hover:bg-cream-alt/60 hover:text-ink"
              )}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={t.icon} />
              </svg>
              {t.label}
            </Link>
          );
        })}
      </nav>

      <div className="animate-fade-in-up">{children}</div>
    </div>
  );
}
