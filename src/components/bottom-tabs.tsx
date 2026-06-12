"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconCart,
  IconChat,
  IconDashboard,
  IconMore,
} from "@/components/icons";

const TABS = [
  { href: "/app", label: "Geral", exact: true, icon: IconDashboard },
  { href: "/app/conversas", label: "Conversas", icon: IconChat },
  { href: "/app/vendas", label: "Vendas", icon: IconCart, badge: 1 },
  { href: "/app/configuracoes", label: "Mais", icon: IconMore },
];

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur
                 border-t border-line flex items-stretch pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegação mobile"
    >
      {TABS.map(({ href, label, exact, icon: Icon, badge }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`relative flex-1 flex flex-col items-center gap-1 py-2.5 min-h-14
                        text-micro font-medium transition-colors ${
              active ? "text-brand-500" : "text-neutral-600"
            }`}
          >
            <span className="relative">
              <Icon size={20} />
              {badge != null && badge > 0 && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-brand-500 text-white text-[9px] leading-[14px] text-center font-semibold">
                  {badge}
                </span>
              )}
            </span>
            {label}
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full bg-gradient-to-r from-brand-500 to-brand-400" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
