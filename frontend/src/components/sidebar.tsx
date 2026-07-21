"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconCart,
  IconChat,
  IconDashboard,
  IconLogout,
  IconMore,
  IconSettings,
  IconTrend,
  IconUsers,
} from "@/components/icons";
import { logoutAction } from "@/server/auth/login";

const WORKSPACE = [
  { href: "/dashboard", label: "Dashboard", exact: true, icon: IconDashboard },
  { href: "/conversas", label: "Conversas", icon: IconChat },
  { href: "/vendas", label: "Vendas", icon: IconCart },
  { href: "/clientes", label: "Clientes", icon: IconUsers },
] as const;

// Inteligência — abas de dados/projeção do V1 (Simulador; Tendências/Criativos entram depois).
const INTELLIGENCE = [
  { href: "/simulador", label: "Simulador", icon: IconTrend },
] as const;

const SYSTEM = [
  { href: "/configuracoes", label: "Configurações", icon: IconSettings },
] as const;

export interface SidebarUser {
  name: string;
  email: string;
  pharmacyName: string;
  initials: string;
  canAdmin: boolean;
  roleLabel?: string;
  unreadConversations?: number;
}

function NavItem({
  href,
  label,
  icon: Icon,
  exact,
  badge,
  pathname,
}: {
  href: string;
  label: string;
  icon: typeof IconDashboard;
  exact?: boolean;
  badge?: number;
  pathname: string;
}) {
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      title={label}
      aria-current={active ? "page" : undefined}
      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-small
                  justify-center xl:justify-start transition-all duration-150 ${
        active
          ? "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
          : "text-sidebar-text hover:bg-white/[0.05] hover:text-white"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-brand-500 to-brand-400 shadow-[0_0_8px_rgba(212,67,44,0.6)]" />
      )}
      <Icon
        size={18}
        className={`shrink-0 transition-transform duration-150 group-hover:scale-110 ${active ? "text-brand-400" : ""}`}
      />
      <span className="hidden xl:block flex-1">{label}</span>
      {badge != null && (
        <span className="hidden xl:flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500/90 px-1.5 text-micro font-semibold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
  const unread = user.unreadConversations && user.unreadConversations > 0 ? user.unreadConversations : undefined;

  return (
    <aside
      className="glass-sidebar relative isolate overflow-hidden hidden md:flex w-16 xl:w-64 shrink-0 text-sidebar-text
                 flex-col min-h-screen sticky top-0 max-h-screen border-r border-white/[0.06] transition-[width]"
      aria-label="Navegação principal"
    >
      {/* Textura da marca (Pattern T) — bem sutil, não atrapalha leitura */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-repeat opacity-[0.04] mix-blend-screen"
        style={{ backgroundImage: "url('/brand/pattern-t.svg')", backgroundSize: "300px auto" }}
      />
      {/* Sombra vertical (cima → baixo) — aprofunda o contraste p/ leitura dos textos */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-ink-900/55 via-ink-900/15 to-ink-900/45"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-40 bg-gradient-to-b from-brand-500/10 to-transparent"
      />

      {/* Marca + farmácia */}
      <div className="relative z-10 px-3 xl:px-5 pt-6 pb-4 flex items-center gap-3 justify-center xl:justify-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/mark-gradient.svg" alt="Recepta" className="h-9 w-9 shrink-0 xl:hidden" />
        <div className="hidden xl:flex min-w-0 items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/mark-white.svg" alt="" className="h-8 w-8 shrink-0" />
          <div className="min-w-0">
            <p className="truncate font-display text-subtitle font-bold tracking-tight text-white">
              Recepta <span className="font-normal text-white/70">Orbit</span>
            </p>
            <p className="truncate text-micro text-sidebar-text">{user.pharmacyName}</p>
          </div>
        </div>
      </div>

      {/* Busca (⌘K) */}
      <div className="relative z-10 hidden xl:block px-4 pb-3">
        <button
          type="button"
          data-command-trigger
          className="flex w-full items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-caption text-sidebar-text transition-colors hover:bg-white/[0.07] hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <span className="flex-1 text-left">Buscar...</span>
        </button>
      </div>

      {/* Navegação */}
      <nav className="relative z-10 flex-1 overflow-y-auto px-2 xl:px-3 pb-4">
        <p className="hidden xl:block px-3 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">
          Workspace
        </p>
        <div className="space-y-1">
          {WORKSPACE.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              pathname={pathname}
              badge={item.href === "/conversas" ? unread : undefined}
            />
          ))}
        </div>

        <p className="hidden xl:block px-3 pt-5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">
          Inteligência
        </p>
        <div className="space-y-1">
          {INTELLIGENCE.map((item) => (
            <NavItem key={item.href} {...item} pathname={pathname} />
          ))}
        </div>

        <p className="hidden xl:block px-3 pt-5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">
          Sistema
        </p>
        <div className="space-y-1">
          {SYSTEM.map((item) => (
            <NavItem key={item.href} {...item} pathname={pathname} />
          ))}
          {user.canAdmin && <NavItem href="/admin" label="Admin Recepta" icon={IconMore} pathname={pathname} />}
        </div>
      </nav>

      {/* Perfil */}
      <div className="relative z-10 border-t border-white/[0.06] px-3 xl:px-4 py-4">
        <div className="flex items-center gap-3 justify-center xl:justify-start">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-400 text-caption font-semibold text-white">
            {user.initials}
          </div>
          <div className="hidden xl:block min-w-0 flex-1">
            <p className="truncate text-small font-medium text-white">{user.name}</p>
            <p className="truncate text-micro text-sidebar-text">{user.roleLabel ?? user.email}</p>
          </div>
          <form action={logoutAction} className="hidden xl:block">
            <button
              type="submit"
              title="Sair"
              className="rounded-md p-1.5 text-sidebar-text transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <IconLogout size={16} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
