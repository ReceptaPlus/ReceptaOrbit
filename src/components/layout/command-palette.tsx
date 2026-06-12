"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { listContacts } from "@/modules/customers/api";
import { ROUTES } from "@/lib/constants";

const PAGES = [
  { label: "Visão Geral", href: ROUTES.dashboard },
  { label: "Conversas", href: ROUTES.conversas },
  { label: "Vendas", href: ROUTES.vendas },
  { label: "Fila de revisão", href: ROUTES.revisao },
  { label: "Clientes", href: ROUTES.clientes },
  { label: "Configurações", href: ROUTES.configuracoes },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useKeyboardShortcut("k", () => setOpen((v) => !v), { meta: true });

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
            <CommandItem key={p.href} onSelect={() => go(p.href)}>
              {p.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Contatos">
          {listContacts().map((c) => (
            <CommandItem key={c.id} onSelect={() => go(ROUTES.cliente(c.id))}>
              {c.name}
              <span className="ml-2 text-xs text-secondary">{c.phoneMasked}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
