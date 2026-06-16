"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/configuracoes/usuarios", label: "Usuários" },
  { href: "/configuracoes/integracoes", label: "Integrações" },
  { href: "/configuracoes/farmacia", label: "Farmácia" },
];

export default function ConfiguracoesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold font-display">Configurações</h1>
        <p className="text-sm text-secondary mt-1">Usuários, integrações e dados da farmácia.</p>
      </header>
      <nav className="flex gap-1 border-b border-line" aria-label="Seções de configuração">
        {TABS.map((t) => {
          const active = pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "px-4 py-2 text-sm rounded-t-lg -mb-px border-b-2 transition-colors",
                active
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-secondary hover:text-ink"
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
