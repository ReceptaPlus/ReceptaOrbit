# Recepta Orbit — Arquitetura Frontend (Next.js 15)

> Stack: App Router · TypeScript strict · Tailwind v4 · shadcn/ui · TanStack Table · Recharts · React Hook Form · Zod.
> Sem backend — camada de dados isolada em `modules/*/api.ts` com mocks, pronta para trocar por fetch real.

---

## 1. Estrutura de pastas

```
apps/web/src/
│
├─ app/                                # APENAS roteamento — zero lógica
│  ├─ layout.tsx                       # Root: fontes, providers, <html>
│  ├─ globals.css                      # Tokens @theme (design system)
│  ├─ not-found.tsx
│  ├─ error.tsx                        # Error boundary global
│  │
│  ├─ (auth)/                          # Route group: telas públicas
│  │  ├─ layout.tsx                    # Centrado, sem sidebar, hero da marca
│  │  ├─ login/page.tsx
│  │  └─ recuperar-senha/page.tsx
│  │
│  └─ (dashboard)/                     # Route group: shell autenticado
│     ├─ layout.tsx                    # Sidebar + BottomTabs + <main>
│     ├─ dashboard/page.tsx            # /dashboard — Visão Geral
│     ├─ conversas/
│     │  ├─ page.tsx
│     │  ├─ loading.tsx                # Skeleton da tabela
│     │  └─ [conversationId]/
│     │     ├─ page.tsx
│     │     └─ loading.tsx
│     ├─ vendas/
│     │  ├─ page.tsx
│     │  ├─ loading.tsx
│     │  └─ revisao/page.tsx           # Fila de revisão (triage)
│     ├─ clientes/
│     │  ├─ page.tsx
│     │  ├─ loading.tsx
│     │  └─ [contactId]/page.tsx
│     └─ configuracoes/
│        ├─ layout.tsx                 # Tabs laterais (usuarios/integracoes/farmacia)
│        ├─ page.tsx                   # redirect → usuarios
│        ├─ usuarios/page.tsx
│        ├─ integracoes/page.tsx
│        └─ farmacia/page.tsx
│
├─ components/                         # Compartilhado, SEM domínio
│  ├─ ui/                              # shadcn/ui (gerado pelo CLI, customizado)
│  │  ├─ button.tsx  badge.tsx  card.tsx  input.tsx  select.tsx
│  │  ├─ dialog.tsx  sheet.tsx  dropdown-menu.tsx  table.tsx
│  │  ├─ tabs.tsx  toast.tsx  tooltip.tsx  skeleton.tsx
│  │  ├─ form.tsx                      # wrapper RHF + shadcn
│  │  └─ command.tsx                   # base do ⌘K
│  ├─ layout/
│  │  ├─ sidebar.tsx                   # 240px → 64px (xl/md)
│  │  ├─ bottom-tabs.tsx               # mobile <768px
│  │  ├─ page-header.tsx               # título + descrição + ações
│  │  ├─ command-palette.tsx           # ⌘K (cmdk)
│  │  └─ tenant-switcher.tsx           # Admin Recepta multi-farmácia
│  ├─ tables/
│  │  ├─ data-table.tsx                # TanStack: genérica <TData, TValue>
│  │  ├─ data-table-toolbar.tsx        # filtros facetados + busca
│  │  ├─ data-table-pagination.tsx
│  │  └─ data-table-mobile-cards.tsx   # render alternativo <768px
│  ├─ charts/
│  │  ├─ bar-chart.tsx                 # Recharts wrappers com tokens da marca
│  │  ├─ spark-line.tsx
│  │  └─ chart-tooltip.tsx
│  ├─ forms/
│  │  ├─ form-field.tsx                # label + erro + hint padronizados
│  │  └─ money-input.tsx               # centavos ↔ BRL
│  └─ feedback/
│     ├─ empty-state.tsx               # ícone + texto + CTA
│     ├─ confidence-pill.tsx           # verde/âmbar/vermelho
│     └─ kpi-card.tsx
│
├─ modules/                            # Domínio — cada um exporta API pública via index.ts
│  ├─ auth/
│  │  ├─ components/login-form.tsx
│  │  ├─ schemas.ts                    # Zod: loginSchema
│  │  ├─ hooks.ts                      # useSession (mock)
│  │  └─ index.ts
│  ├─ dashboard/
│  │  ├─ components/                   # kpi-grid, sales-by-source, top-products
│  │  ├─ api.ts                        # getDashboard() — mock hoje, fetch amanhã
│  │  └─ index.ts
│  ├─ conversations/
│  │  ├─ components/                   # cycles-table, columns.tsx, message-timeline,
│  │  │                                #   classification-panel, attribution-panel
│  │  ├─ schemas.ts                    # Zod: correctionSchema (corrigir classificação)
│  │  ├─ api.ts                        # listCycles(), getCycle(id)
│  │  ├─ types.ts                      # Stage, CycleStatus, Outcome…
│  │  └─ index.ts
│  ├─ sales/
│  │  ├─ components/                   # sales-table, columns.tsx, review-card, sale-items
│  │  ├─ schemas.ts                    # Zod: confirmSaleSchema, adjustValueSchema
│  │  ├─ api.ts
│  │  ├─ types.ts
│  │  └─ index.ts
│  ├─ customers/
│  │  ├─ components/                   # customers-table, columns.tsx, customer-profile
│  │  ├─ api.ts
│  │  ├─ types.ts
│  │  └─ index.ts
│  └─ settings/
│     ├─ components/                   # users-table, invite-dialog, integration-card,
│     │                                #   pharmacy-form
│     ├─ schemas.ts                    # Zod: inviteUserSchema, pharmacySchema
│     ├─ api.ts
│     └─ index.ts
│
├─ providers/
│  ├─ index.tsx                        # composição: <Providers>{children}</Providers>
│  ├─ query-provider.tsx               # TanStack Query (cache p/ futuro fetch)
│  ├─ toast-provider.tsx
│  └─ command-provider.tsx             # estado global do ⌘K
│
├─ hooks/                              # Genéricos, sem domínio
│  ├─ use-media-query.ts
│  ├─ use-debounce.ts
│  ├─ use-local-storage.ts
│  ├─ use-keyboard-shortcut.ts         # C/E/X na fila, ⌘K
│  └─ use-data-table.ts                # estado TanStack (sorting/filters/pagination)
│
├─ lib/
│  ├─ utils.ts                         # cn() — clsx + tailwind-merge
│  ├─ format.ts                        # formatBRL (centavos), formatDate, maskPhone
│  ├─ constants.ts                     # labels PT-BR dos enums, rotas nomeadas
│  └─ env.ts                           # validação Zod de variáveis de ambiente
│
└─ types/
   ├─ api.ts                           # envelope { data, error } padrão
   └─ global.d.ts
```

**Regras de dependência (importam apenas para baixo):**

```
app → modules → components → lib/hooks/types
        ↓
   components (ui genérico)
```

- `app/` nunca contém JSX de domínio — só compõe módulos.
- `modules/X` nunca importa `modules/Y` (cross-link via página).
- `components/` nunca importa de `modules/` — se precisa de domínio, mora no módulo.

---

## 2. Layouts

| Layout | Responsabilidade |
|---|---|
| `app/layout.tsx` | `<html lang="pt-BR">`, fontes (Montserrat/Poppins via next/font), `<Providers>` |
| `(auth)/layout.tsx` | Split hero (degradê da marca) + slot do formulário; sem navegação |
| `(dashboard)/layout.tsx` | `Sidebar` (desktop) + `BottomTabs` (mobile) + `CommandPalette` + `<main>` com padding responsivo |
| `configuracoes/layout.tsx` | Sub-navegação em tabs persistente entre as 3 seções |

Route groups `(auth)` e `(dashboard)` não afetam a URL — só segmentam layouts.

---

## 3. Rotas

| URL | Página | Tipo |
|---|---|---|
| `/login` | Login | Estática |
| `/recuperar-senha` | Recuperação | Estática |
| `/dashboard` | Visão Geral | Server Component |
| `/conversas` | Listagem de ciclos | SC + tabela client |
| `/conversas/[conversationId]` | Timeline + classificação | Dinâmica |
| `/vendas` | Listagem de vendas | SC + tabela client |
| `/vendas/revisao` | Fila de triage | Client (atalhos de teclado) |
| `/clientes` | Listagem consolidada | SC + tabela client |
| `/clientes/[contactId]` | Ficha do cliente | Dinâmica |
| `/configuracoes/{usuarios,integracoes,farmacia}` | 3 seções | SC + forms client |

Padrão: **Server Components por default**; `"use client"` só em tabelas interativas, forms, palette e charts.
`loading.tsx` com skeletons em toda listagem; `error.tsx` por grupo.

---

## 4. Componentes — papel de cada biblioteca

| Biblioteca | Onde entra | Customização Recepta |
|---|---|---|
| **shadcn/ui** | `components/ui/` — primitivos | Tokens no `globals.css`: `--primary: #D4432C`, radius 12px, fonte Montserrat |
| **TanStack Table** | `components/tables/data-table.tsx` | Genérica; cada módulo define `columns.tsx`; números `tabular-nums` à direita |
| **Recharts** | `components/charts/` | Paleta fixa: barras `brand-500/400/300`, verde só em séries de sucesso |
| **React Hook Form** | `components/ui/form.tsx` + forms dos módulos | Erros inline padrão Stripe |
| **Zod** | `modules/*/schemas.ts` | Schemas únicos: validam form E tipam payload futuro da API |

Componentes de marca (fora do shadcn): `ConfidencePill`, `SourceBadge`, `StageBadge`, `KpiCard`, `EmptyState`, `MessageTimeline`, `ReviewCard`.

---

## 5. Providers

```
<QueryProvider>            ← TanStack Query: hoje serve mocks, amanhã API
  <CommandProvider>        ← estado do ⌘K
    <TooltipProvider>
      {children}
      <Toaster />          ← sonner, posição bottom-right
    </TooltipProvider>
  </CommandProvider>
</QueryProvider>
```

Composição única em `providers/index.tsx`, consumida só no root layout.
Sem provider de auth real — `useSession()` mock em `modules/auth/hooks.ts` com a mesma assinatura que o Auth.js terá.

---

## 6. Hooks

| Hook | Uso |
|---|---|
| `useMediaQuery("(min-width: 768px)")` | Alternar DataTable ↔ MobileCards |
| `useDataTable(columns, data)` | Encapsula sorting/filtering/pagination do TanStack |
| `useKeyboardShortcut("c", confirm)` | Fila de revisão (C/E/X) e ⌘K |
| `useDebounce(search, 300)` | Busca de clientes |
| `useLocalStorage("sidebar-collapsed")` | Persistir preferência de UI |

Hooks de dados ficam nos módulos (`useCycles`, `useSales`) — embrulham TanStack Query sobre `api.ts`.

---

## 7. Design System (integração shadcn × marca)

`globals.css` já define os tokens (ver `docs/DESIGN-SYSTEM.md`). Mapeamento para o shadcn:

```
--background   → cream-100 (#FFF5D9)     --primary        → brand-500 (#D4432C)
--card         → #FFFFFF                  --primary-foreground → #FFFFFF
--foreground   → ink-900 (#0A0D0C)        --secondary      → cream-200 (#F1EBE0)
--muted        → neutral-100              --destructive    → danger
--border       → neutral-200 (#E8E2D2)    --ring           → brand-500 (focus)
--radius       → 12px
```

- Variantes extras do `Button`: `default` (laranja), `outline`, `ghost`, `success` **não existe** — verde nunca é botão (manual).
- `Badge` ganha variantes por canal: `meta`, `google`, `instagram`, `whatsapp`, `direct`.
- Charts: gradiente permitido apenas `brand-500→400` em área de sparkline (única exceção, vem do manual).
- Tipografia shadcn herda `--font-sans` (Montserrat); títulos usam classe `font-display` (Poppins/Nexa).

---

## Migração do protótipo atual

1. `npx shadcn@latest init` + mapear tokens acima
2. Mover telas atuais para route groups `(auth)`/`(dashboard)` — URLs mudam de `/app/*` para `/*` (dashboard em `/dashboard`)
3. Extrair `mock-data.ts` para `modules/*/api.ts` + `types.ts` por domínio
4. Substituir tabelas manuais por `DataTable` (TanStack) com `columns.tsx` por módulo
5. Trocar gráficos SVG manuais por wrappers Recharts
6. Adicionar `vendas/revisao`, `command-palette`, `loading.tsx` skeletons
```
