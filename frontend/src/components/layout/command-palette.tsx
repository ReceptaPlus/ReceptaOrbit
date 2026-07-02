"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { listTenantContactsAction, type ContactSearchItem } from "@/modules/customers/actions";
import { ROUTES } from "@/lib/constants";

const PAGES = [
  { label: "Visão Geral", href: ROUTES.dashboard },
  { label: "Conversas", href: ROUTES.conversas },
  { label: "Clientes", href: ROUTES.clientes },
  { label: "Configurações", href: ROUTES.configuracoes },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [contacts, setContacts] = useState<ContactSearchItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Abre ao clicar no gatilho da busca (sidebar). Sem atalho de teclado.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement | null)?.closest?.("[data-command-trigger]")) {
        setOpen(true);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Carrega contatos reais do tenant na primeira abertura (filtro é client-side).
  useEffect(() => {
    if (open && !loaded) {
      listTenantContactsAction()
        .then((c) => setContacts(c))
        .finally(() => setLoaded(true));
    }
  }, [open, loaded]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Busca" description="Navegue ou busque contatos">
      <CommandInput placeholder="Buscar tela ou contato…" />
      <CommandList>
        <CommandEmpty>Nada encontrado.</CommandEmpty>
        <CommandGroup heading="Ir para">
          {PAGES.map((p) => (
            <CommandItem key={p.href} value={p.label} onSelect={() => go(p.href)}>
              {p.label}
            </CommandItem>
          ))}
        </CommandGroup>
        {contacts.length > 0 && (
          <CommandGroup heading="Contatos">
            {contacts.map((c) => (
              <CommandItem
                key={c.id}
                value={`${c.name} ${c.phoneDisplay}`}
                onSelect={() => go(ROUTES.cliente(c.id))}
              >
                {c.name}
                <span className="ml-2 text-xs text-secondary">{c.phoneDisplay}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
