# Época 1 — Plano Físico do Repositório

> Mapa exato de pastas/arquivos antes da implementação. Legenda: 🆕 criar · ✏ modificar · ✅ inalterado · 🗑 remover.

---

## 1. Estrutura completa

```
src/
├── contracts/                          🆕 TIPOS CONGELADOS (CONTRATOS-FRONTEND.md em código)
│   ├── domain.ts                       🆕 Entidades+VOs (User…AuditLog, Money, ActorRef, enums)
│   ├── view-models.ts                  🆕 DashboardVM, CycleRowVM, SaleRowVM… (Parte 2)
│   ├── permissions.ts                  🆕 type Action + matriz papel×ação (dados puros)
│   ├── ui-state.ts                     🆕 UIState<T> + ApiError + Page<T>
│   └── index.ts                        🆕 barrel
│
├── mocks/                              🆕 ÚNICA fonte de dado falso (tipada por contracts)
│   ├── users.mock.ts                   🆕 5 users (gerente default, viewer, 2º gerente, convidada, staff)
│   ├── platform-staff.mock.ts          🆕 1 PLATFORM_ADMIN (fora de memberships)
│   ├── pharmacies.mock.ts              🆕 3 tenants (thresholds 0.85/0.70; estados WA distintos)
│   ├── memberships.mock.ts             🆕 6 vínculos (1 user c/ 2 farmácias, 1 INVITED, 1 SUSPENDED, OWNER presente)
│   ├── whatsapp.mock.ts                🆕 3 conexões (CONNECTED/DOWN/PAIRING)
│   ├── contacts.mock.ts                🆕 9+ contatos (recorrente, novo, só-orçamento, tenant B)
│   ├── conversations.mock.ts           🆕 8 ciclos + messages (OPEN, needsReview, tenant B…)
│   ├── analyses.mock.ts                🆕 10 versões (ciclo c/ v1 IA + v2 humana supersedida)
│   ├── sales.mock.ts                   🆕 6 vendas (PENDING, MANUAL cycleId:null, REFUNDED…)
│   ├── tracking-links.mock.ts          🆕 3 links (ativo c/ cliques, zerado, desativado)
│   ├── audit.mock.ts                   🆕 8 entradas (correção before/after, staff onBehalfOf)
│   ├── session.mock.ts                 🆕 sessão simulada mutável { userId, pharmacyId } 
│   └── index.ts                        🆕 barrel
│
├── app/
│   ├── layout.tsx                      ✅ fontes+Providers+Toaster
│   ├── globals.css                     ✅ tokens
│   ├── page.tsx                        ✅ redirect /login
│   ├── not-found.tsx                   🆕 404 com marca + link dashboard
│   ├── error.tsx                       🆕 erro global com marca + retry
│   ├── (auth)/
│   │   ├── layout.tsx                  ✅
│   │   ├── login/page.tsx              ✏ valida contra users.mock (loginSchema); links reais
│   │   ├── recuperar-senha/page.tsx    🆕 form e-mail → confirmação neutra
│   │   ├── convite/[token]/page.tsx    🆕 contexto+senha+termos; token "demo" ok, outros→expirado
│   │   └── escolher-farmacia/page.tsx  🆕 grid PharmacyCard + busca (sessão 2+ memberships)
│   └── (dashboard)/
│       ├── layout.tsx                  ✏ + GlobalBanner + DevSwitcher(dev) + skip-link
│       ├── dashboard/
│       │   ├── page.tsx                ✏ consome getDashboard() VM; empty onboarding se WA≠CONNECTED
│       │   └── loading.tsx             🆕 skeleton KPI+charts
│       ├── conversas/
│       │   ├── page.tsx                ✏ getConversations() VM
│       │   ├── loading.tsx             ✅
│       │   └── [conversationId]/
│       │       ├── page.tsx            ✏ CycleDetailVM (análise vigente, trilha); can(edit_classification)
│       │       └── loading.tsx         🆕 skeleton bolhas+painel
│       ├── vendas/
│       │   ├── page.tsx                ✏ SaleRowVM; can(confirm_sale)
│       │   ├── loading.tsx             ✅
│       │   ├── [saleId]/page.tsx       🆕 itens + atribuição + AuditTimeline
│       │   └── revisao/page.tsx        ✏ pendentes do mock novo; E abre MoneyInput
│       ├── clientes/
│       │   ├── page.tsx                ✏ ContactRowVM; busca funcional (debounce); máscara por papel
│       │   ├── loading.tsx             ✅
│       │   └── [contactId]/page.tsx    ✏ VM consolidado
│       ├── configuracoes/
│       │   ├── layout.tsx              ✏ 7 tabs (4 novas), gate can() por tab
│       │   ├── page.tsx                ✅ redirect usuarios
│       │   ├── usuarios/page.tsx       ✏ memberships.mock; InviteDialog; linha INVITED c/ reenviar/cancelar; ⋯ suspender
│       │   ├── integracoes/page.tsx    ✏ ConfirmationDialog reforçado no desconectar WA
│       │   ├── whatsapp/page.tsx       🆕 StatusHero+QrPanel; máquina de estados simulada
│       │   ├── farmacia/page.tsx       ✅ (já RHF+Zod)
│       │   ├── rastreamento/page.tsx   🆕 tabela links + GerarLink Dialog + CopyField
│       │   ├── ia/page.tsx             🆕 ThresholdSlider c/ preview calculado dos mocks
│       │   └── auditoria/page.tsx      🆕 AuditTimeline + filtro por ação
│       ├── conta/
│       │   ├── perfil/page.tsx         🆕 avatar iniciais + nome editável + memberships ro
│       │   └── seguranca/page.tsx      🆕 alterar senha (mock valida "12345678") + "2FA em breve"
│       └── admin/
│           └── farmacias/page.tsx      🆕 DataTable tenants + criar Dialog + "entrar como suporte"
│
├── components/
│   ├── ui/                             ✅ 15 shadcn existentes
│   │   ├── slider.tsx                  🆕 (shadcn) p/ ThresholdSlider
│   │   ├── alert-dialog.tsx            🆕 (shadcn) base do ConfirmationDialog
│   │   ├── avatar.tsx                  🆕 (shadcn) AvatarMenu
│   │   └── sheet.tsx                   🆕 (shadcn) menus mobile / modais <768px
│   ├── layout/
│   │   ├── command-palette.tsx         ✏ rotas novas; abre via botão visível também
│   │   ├── avatar-menu.tsx             🆕 dropdown identidade (conta, trocar farmácia, suporte, sair)
│   │   ├── tenant-switcher.tsx         🆕 dropdown tenants c/ pendências; visível se 2+
│   │   ├── global-banner.tsx           🆕 WA DOWN → banner persistente; colapsável mobile
│   │   └── dev-switcher.tsx            🆕 (só dev) alterna papel/farmácia p/ testar can()
│   ├── feedback/
│   │   ├── empty-state.tsx             🆕 3 variantes (onboarding/filter/success)
│   │   ├── status-hero.tsx             🆕 estado grande da conexão WA
│   │   ├── qr-panel.tsx                🆕 QR fake + countdown 60s + "simular scan" (dev)
│   │   ├── copy-field.tsx              🆕 URL + copiar c/ feedback
│   │   ├── threshold-slider.tsx        🆕 slider + preview de impacto
│   │   └── audit-timeline.tsx          🆕 ol semântica, antes→depois textual
│   ├── tables/data-table.tsx           ✏ + tabIndex/Enter nas linhas (a11y)
│   ├── charts/bar-chart.tsx            ✅
│   ├── badges.tsx                      ✏ tipos vindos de contracts; + RoleBadge
│   ├── sidebar.tsx                     ✏ busca visível, badges derivados, AvatarMenu+TenantSwitcher no rodapé, variante staff, logo clicável
│   └── bottom-tabs.tsx                 ✏ "Mais" abre Sheet (Clientes, Config, Conta, Trocar farmácia, Sair)
│
├── modules/                            api.ts = assinaturas da Parte 3 lendo mocks
│   ├── tenancy/                        🆕 sessão, memberships, switchPharmacy, can()
│   │   ├── api.ts                      🆕 getCurrentSession, getMemberships, switchPharmacy, can(action)
│   │   ├── store.ts                    🆕 estado reativo da sessão simulada (Context leve)
│   │   └── index.ts                    🆕
│   ├── admin/
│   │   ├── api.ts                      🆕 adminListPharmacies, adminCreatePharmacy, adminSuspend
│   │   └── index.ts                    🆕
│   ├── auth/{schemas,hooks,index}.ts   ✏ hooks lê tenancy/store (assinatura mantida)
│   ├── conversations/
│   │   ├── api.ts                      ✏ VMs + getCurrentAnalysis + correctClassification (local)
│   │   ├── schemas.ts                  ✅ correctionSchema
│   │   ├── components/cycles-table.tsx ✏ tipos de contracts
│   │   ├── components/correct-dialog.tsx 🆕 modal Corrigir (RHF+schema) → análise v+1 + audit + toast
│   │   └── index.ts                    ✏
│   ├── sales/{api,schemas,index}.ts    ✏ VMs; confirm/reject mutam estado local + audit
│   ├── customers/{api,index}.ts        ✏ VMs; máscara por papel via can(view_full_phone)
│   ├── dashboard/{api,index}.ts        ✏ DashboardVM calculado dos mocks
│   └── settings/{api,schemas,index}.ts ✏ team(memberships VM), whatsapp, tracking, ai, audit
│
├── providers/{index,query-provider}.tsx ✏ index inclui TenancyProvider (store)
├── hooks/                               ✅ +
│   └── use-ui-state.ts                  🆕 envelopa fetch→UIState<T> (loading/empty/error/ready)
├── lib/
│   ├── constants.ts                     ✏ ROUTES completo + labels novos (roles, ações de audit)
│   ├── format.ts                        ✏ + maskPhone, formatRelative ("há 3h")
│   ├── utils.ts                         ✅
│   └── mock-data.ts                     🗑 REMOVIDO (violava contratos)
└── types/
    └── api.ts                           🗑 REMOVIDO (→ contracts/ui-state.ts)
```

Módulos antigos `types.ts` (conversations, sales, customers, settings): 🗑 **removidos** — tipos canônicos passam a vir de `contracts/domain.ts` (um único lugar; era duplicação à espera de divergir).

## 2–3. Contagem

| | Qtde |
|---|---|
| **Arquivos novos** | **51** (contracts 5 · mocks 13 · rotas 15 · components 10 · ui-shadcn 4 · modules 4) |
| **Arquivos modificados** | 24 |
| **Arquivos removidos** | 6 (`lib/mock-data.ts`, `types/api.ts`, 4× `modules/*/types.ts`) |

## 4. Dependências adicionadas

| Pacote | Motivo |
|---|---|
| `@radix-ui/react-slider` | shadcn slider (ThresholdSlider) |
| `@radix-ui/react-alert-dialog` | ConfirmationDialog |
| `@radix-ui/react-avatar` | AvatarMenu |
| *(sheet usa react-dialog já instalado)* | — |

Nada além: zero Prisma/Auth/HTTP — Época 1 é estática+mocks.

## 5. Rotas ao final (22 + 2 globais)

`/login · /recuperar-senha · /convite/[token] · /escolher-farmacia · /dashboard · /conversas · /conversas/[id] · /vendas · /vendas/[id] · /vendas/revisao · /clientes · /clientes/[id] · /configuracoes/{usuarios·integracoes·whatsapp·farmacia·rastreamento·ia·auditoria} · /conta/{perfil·seguranca} · /admin/farmacias` + `not-found` + `error`. **Nenhum link renderizado aponta para rota inexistente.**

## 6. Componentes ao final

ui (19 shadcn) · layout: Sidebar, BottomTabs, CommandPalette, AvatarMenu, TenantSwitcher, GlobalBanner, DevSwitcher · tables: DataTable · charts: BarChart · feedback: EmptyState, StatusHero, QrPanel, CopyField, ThresholdSlider, AuditTimeline · badges (Stage/Status/Outcome/Source/SaleStatus/Role/ConfidencePill) · icons · domínio: CyclesTable, CorrectDialog (+ composições internas das páginas).

## 7. Mocks ao final

Os 13 de `src/mocks/` (Parte 4 dos contratos) — cada estado visual da UI tem dado que o produz; isolamento de tenant verificável (dados de `pha_vida` nunca aparecem em `pha_dsp`).

---

### Respostas diretas

> **"Quantos arquivos novos serão criados?"** — **51.**
> **"Quais arquivos atuais serão removidos?"** — `src/lib/mock-data.ts`, `src/types/api.ts`, `src/modules/conversations/types.ts`, `src/modules/sales/types.ts`, `src/modules/customers/types.ts`, `src/modules/settings/types.ts`.

Garantias anti-entropia: um só lugar para tipos (`contracts/`), um só padrão de mock (`*.mock.ts`), um só guard (`can()`), um só formato de estado (`UIState<T>`), zero `Button2.tsx`.
