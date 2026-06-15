"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconCart,
  IconChat,
  IconDashboard,
  IconLogout,
  IconSettings,
  IconUser,
  IconUsers,
} from "@/components/icons";
import { Logo } from "@/components/brand/logo";

const NAV = [
  { href: "/dashboard", label: "Visão Geral", exact: true, icon: IconDashboard },
  { href: "/conversas", label: "Conversas", icon: IconChat, badge: 2 },
  { href: "/vendas", label: "Vendas", icon: IconCart, badge: 1 },
  { href: "/clientes", label: "Clientes", icon: IconUsers },
  { href: "/configuracoes", label: "Configurações", icon: IconSettings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex w-16 xl:w-60 shrink-0 bg-sidebar text-sidebar-text
                 flex-col min-h-screen sticky top-0 max-h-screen transition-[width]"
      aria-label="Navegação principal"
    >
      {/* Marca — logo oficial, versão negativa (creme sobre escuro) */}
      <div className="px-3 xl:px-5 py-6 flex items-center justify-center xl:justify-start text-[#FFF5D9]">
        <Logo variant="mark" size={30} className="xl:hidden" />
        <Logo variant="wordmark" size={26} className="hidden xl:inline-flex" />
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-2 xl:px-3 space-y-1">
        {NAV.map(({ href, label, exact, icon: Icon, badge }) => {
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
              {/* Indicador ativo: degradê do manual */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-gradient-to-b from-brand-500 to-brand-400" />
              )}
              <Icon size={18} className="shrink-0" />
              <span className="hidden xl:block flex-1">{label}</span>
              {badge != null && badge > 0 && (
                <span
                  className="hidden xl:inline-flex items-center justify-center min-w-5 h-5 rounded-full
                             bg-brand-500 text-white text-micro font-semibold px-1.5"
                  aria-label={`${badge} pendentes`}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Tenant + sessão */}
      <div className="px-3 xl:px-5 py-5 border-t border-white/10">
        <div className="flex items-center gap-3 justify-center xl:justify-start">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-400 text-white flex items-center justify-center text-caption font-semibold shrink-0">
            DS
          </div>
          <div className="hidden xl:block min-w-0">
            <p className="text-white text-small truncate">Drogaria São Paulo</p>
            <p className="text-micro truncate">antonio@dspaulo.com.br</p>
          </div>
        </div>
        <div className="mt-4 hidden xl:flex flex-col gap-2">
          <Link
            href="/conta/perfil"
            className={`flex items-center gap-2 text-caption transition-colors ${
              pathname.startsWith("/conta") ? "text-white" : "hover:text-white"
            }`}
          >
            <IconUser size={14} />
            Minha Conta
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 text-caption hover:text-white transition-colors"
          >
            <IconLogout size={14} />
            Sair
          </Link>
        </div>
      </div>
    </aside>
  );
}
