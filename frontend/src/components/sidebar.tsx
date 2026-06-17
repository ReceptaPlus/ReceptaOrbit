"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconCart,
  IconChat,
  IconDashboard,
  IconLogout,
  IconSettings,
  IconUsers,
} from "@/components/icons";
import { logoutAction } from "@/server/auth/login";

const NAV = [
  { href: "/dashboard", label: "Visão Geral", exact: true, icon: IconDashboard },
  { href: "/conversas", label: "Conversas", icon: IconChat },
  { href: "/vendas", label: "Vendas", icon: IconCart },
  { href: "/clientes", label: "Clientes", icon: IconUsers },
  { href: "/configuracoes", label: "Configurações", icon: IconSettings },
];

export interface SidebarUser {
  name: string;
  email: string;
  pharmacyName: string;
  initials: string;
  canAdmin: boolean;
}

export function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex w-16 xl:w-60 shrink-0 bg-sidebar text-sidebar-text
                 flex-col min-h-screen sticky top-0 max-h-screen transition-[width]"
      aria-label="Navegação principal"
    >
      {/* Marca */}
      <div className="px-3 xl:px-5 py-6 flex items-center gap-2.5 justify-center xl:justify-start">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-white font-display font-bold text-sm leading-none">R</span>
        </div>
        <span className="hidden xl:block text-white font-semibold tracking-tight font-display text-subtitle">
          Recepta Orbit
        </span>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-2 xl:px-3 space-y-1">
        {NAV.map(({ href, label, exact, icon: Icon }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-current={active ? "page" : undefined}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-small
                          justify-center xl:justify-start transition-colors duration-150 ${
                active
                  ? "bg-sidebar-accent text-white"
                  : "hover:bg-sidebar-accent/60 hover:text-white"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-gradient-to-b from-brand-500 to-brand-400" />
              )}
              <Icon size={18} className="shrink-0" />
              <span className="hidden xl:block flex-1">{label}</span>
            </Link>
          );
        })}

        {user.canAdmin && (
          <Link
            href="/admin"
            title="Administração"
            className="group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-small
                       justify-center xl:justify-start transition-colors duration-150
                       hover:bg-sidebar-accent/60 hover:text-white"
          >
            <IconSettings size={18} className="shrink-0" />
            <span className="hidden xl:block flex-1">Administração</span>
          </Link>
        )}
      </nav>

      {/* Sessão */}
      <div className="px-3 xl:px-5 py-5 border-t border-white/10">
        <div className="flex items-center gap-3 justify-center xl:justify-start">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-400 text-white flex items-center justify-center text-caption font-semibold shrink-0">
            {user.initials}
          </div>
          <div className="hidden xl:block min-w-0">
            <p className="text-white text-small truncate">{user.pharmacyName}</p>
            <p className="text-micro truncate">{user.email}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="mt-4 hidden xl:flex items-center gap-2 text-caption hover:text-white transition-colors"
          >
            <IconLogout size={14} />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
