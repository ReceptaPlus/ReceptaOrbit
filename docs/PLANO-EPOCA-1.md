# Época 1 — Plano Técnico: Plataforma Visual Navegável

> Escopo autorizado: **shell + design system + mocks + navegação completa**. Sem Prisma, sem Auth, sem API, sem Evolution. Tudo clicável, tudo responsivo, dados 100% falsos — mas com o **formato do domínio validado** (DOMAIN-MODEL.md), para que a troca mock→API não mude nenhum componente.

---

## 1. Plano por rota

Formato: **Objetivo · Layout · Componentes · Mocks · Vazio · Erro · Loading · Permissões simuladas**

| Rota | Especificação |
|---|---|
| `/login` | Autenticar (simulado). · `(auth)` split-hero. · LoginForm (RHF+`loginSchema`), PasswordInput. · `users.mock`. · ➖ · credencial inválida simulada (user inexistente no mock) → erro inline. · pending no botão. · público. |
| `/recuperar-senha` | Fluxo visual de recuperação. · `(auth)` card central. · Form e-mail → tela de confirmação neutra. · ➖ · ➖ · ➖ · pending. · público. |
| `/convite/[token]` | Primeiro acesso do convidado. · `(auth)`. · Contexto (farmácia+papel+quem convidou), form senha, termos. · `invites.mock` (token "demo" válido; outros → expirado). · ➖ · token inválido/expirado (telas distintas). · pending. · público. |
| `/escolher-farmacia` | Selecionar tenant. · `(auth)` (sem sidebar — contexto ainda não existe). · PharmacyCard grid, SearchInput. · `pharmacies.mock` (3: uma com WhatsApp caído, uma com pendências). · staff sem farmácias → CTA admin. · retry. · skeleton grid. · sessão simulada com 2+ memberships. |
| `/dashboard` | Radar do dia; drill-down em todo número. · `(dashboard)`. · KpiCard×4 (pendência→link fila), BarChart, TopProducts, SourceCards, RecentCycles. · `sales/conversations/dashboard.mock`. · onboarding "Conecte o WhatsApp" quando instance≠CONNECTED. · error.tsx de grupo. · loading.tsx (novo). · todos os papéis. |
| `/conversas` | Encontrar ciclo. · `(dashboard)`. · CyclesTable (DataTable), Filters, mobile cards. · `conversations.mock`. · DataTable vazio + variante filtro. · error.tsx. · loading.tsx ✓. · todos. |
| `/conversas/[id]` | Validar leitura da IA. · `(dashboard)`. · ChatTimeline, ClassificationPanel (lendo **AIAnalysis vigente**), AttributionPanel, AuditTimeline, Modal Corrigir (grava análise versão+1 no estado local + toast). · `conversations.mock` + `analyses.mock`. · ➖ · notFound custom. · loading.tsx (novo). · Corrigir: só MANAGER (viewer não vê botão). |
| `/vendas` | Conferir números. · `(dashboard)`. · SalesKpis, SalesTable (migrar p/ DataTable), confirmar inline c/ pending. · `sales.mock`. · "vendas aparecem aqui". · error.tsx. · loading.tsx ✓. · confirmar: MANAGER. |
| `/vendas/[id]` | Anatomia da venda. · `(dashboard)`. · SaleHeader, ItemsTable, AttributionPanel, AuditTimeline. · `sales.mock` + `audit.mock`. · trilha vazia → "nenhuma alteração manual". · notFound. · skeleton. · estornar: MANAGER (confirmação simples). |
| `/vendas/revisao` | Zerar pendências <2min. · `(dashboard)`. · ReviewCard, atalhos C/E/X (E abre MoneyInput inline), dots, toast desfazer. · `sales.mock` pendentes. · sucesso "Tudo revisado ✓" ✓. · ➖ · ➖ · MANAGER (viewer → redirect /vendas). |
| `/clientes` | Localizar contato. · `(dashboard)`. · ContactsTable (DataTable), SearchInput funcional (debounce). · `contacts.mock`. · sem clientes/busca sem hit. · error.tsx. · loading.tsx ✓. · todos; telefone mascarado p/ VIEWER. |
| `/clientes/[id]` | Contexto do contato. · `(dashboard)`. · ContactKpis, listas de conversas/compras. · idem. · compras vazias ✓. · notFound. · skeleton (novo). · todos. |
| `/configuracoes/usuarios` | Gerir equipe. · `(dashboard)`+tabs. · UsersTable c/ InviteRow (pendente·reenviar·cancelar), InviteDialog (RHF+`inviteUserSchema`), menu ⋯ (suspender c/ confirmação). · `memberships.mock` (1 convite pendente; SEM staff). · 1 usuário → "convide sua equipe". · toast erro simulado. · skeleton. · MANAGER; VIEWER read-only. |
| `/configuracoes/integracoes` | Estado dos canais. · cards + ConfirmationDialog reforçado no desconectar WhatsApp. · `integrations.mock`. · ➖ · ➖ · skeleton. · MANAGER age. |
| `/configuracoes/whatsapp` | Pareamento (simulado). · StatusHero + QrPanel fake (countdown 60s regenera; botão dev "simular scan"), aviso mobile "use um computador". · `whatsapp.mock` (state). · ➖ · estado Caído → dispara GlobalBanner. · skeleton. · MANAGER. |
| `/configuracoes/farmacia` | Cadastro. · form RHF+Zod ✓. · `pharmacies.mock`. · ➖ · Zod inline ✓. · skeleton. · MANAGER. |
| `/configuracoes/rastreamento` | Links com token. · LinksTable, GerarLink Dialog, CopyField. · `tracking-links.mock`. · "crie seu primeiro link". · ➖ · skeleton. · MANAGER cria. |
| `/configuracoes/ia` | Limiar de confiança. · ThresholdSlider c/ preview ("2 de 10 iriam p/ revisão" calculado dos mocks). · `settings.mock`. · ➖ · ➖ · skeleton. · MANAGER. |
| `/configuracoes/auditoria` | Quem mudou o quê. · AuditTimeline + Filters. · `audit.mock`. · "nenhuma ação registrada". · ➖ · skeleton. · MANAGER. |
| `/conta/perfil` | Identidade pessoal. · `(dashboard)` (max-w 560). · Avatar iniciais, form nome, memberships read-only. · `session.mock`. · ➖ · Zod. · skeleton. · o próprio. |
| `/conta/seguranca` | Alterar senha (simulado). · form 3 campos + "2FA em breve". · ➖ · ➖ · senha atual errada (mock: "12345678"). · pending. · o próprio. |
| `/admin/farmacias` | Staff provisiona/monitora. · `(dashboard)` variante admin (sidebar reduzida: Farmácias + sair). · DataTable, CriarFarmacia Dialog, badge tracejado "entrar como suporte". · `pharmacies.mock`. · CTA criar primeira. · ➖ · skeleton. · `PLATFORM_ADMIN` (sessão simulada trocável). |
| `not-found` global | 404 digno. · standalone. · marca + link dashboard. · ➖. |

**Componentes transversais:** GlobalBanner (instance DOWN → todas as telas do tenant, colapsável no mobile) · TenantSwitcher (sidebar, 2+ memberships) · AvatarMenu (sidebar/sheet Mais) · CommandPalette ✓ (+ botão visível na sidebar).

---

## 2. Estrutura exata de pastas

```
src/
├─ app/
│  ├─ (auth)/{login, recuperar-senha, convite/[token], escolher-farmacia}/page.tsx
│  ├─ (dashboard)/
│  │  ├─ layout.tsx                       # shell tenant
│  │  ├─ dashboard/{page,loading}.tsx
│  │  ├─ conversas/{page,loading}.tsx + [conversationId]/{page,loading}.tsx
│  │  ├─ vendas/{page,loading}.tsx + [saleId]/page.tsx + revisao/page.tsx
│  │  ├─ clientes/{page,loading}.tsx + [contactId]/page.tsx
│  │  ├─ configuracoes/layout.tsx + {usuarios,integracoes,whatsapp,farmacia,rastreamento,ia,auditoria}/page.tsx
│  │  ├─ conta/{perfil,seguranca}/page.tsx
│  │  └─ admin/farmacias/page.tsx
│  ├─ layout.tsx · not-found.tsx · error.tsx · page.tsx(→/login)
├─ components/
│  ├─ ui/            # shadcn (existente + slider, alert-dialog, avatar, sheet)
│  ├─ layout/        # sidebar, bottom-tabs, tenant-switcher, avatar-menu,
│  │                 # global-banner, command-palette, page-header
│  ├─ tables/        # data-table (+ toolbar, mobile-card-list)
│  ├─ charts/        # bar-chart, spark-line
│  ├─ feedback/      # empty-state, kpi-card, confidence-pill, status-hero,
│  │                 # qr-panel, copy-field, threshold-slider
│  └─ badges.tsx
├─ modules/          # {auth,dashboard,conversations,sales,customers,settings,
│  │                 #  tenancy,admin}/ — components/ api.ts types.ts schemas.ts index.ts
├─ mocks/            # ÚNICA fonte de dado falso
│  ├─ pharmacies.mock.ts  users.mock.ts  memberships.mock.ts  session.mock.ts
│  ├─ conversations.mock.ts  analyses.mock.ts  sales.mock.ts  contacts.mock.ts
│  ├─ tracking-links.mock.ts  audit.mock.ts  integrations.mock.ts  settings.mock.ts
│  └─ index.ts
├─ providers/  hooks/  lib/  types/
```

`src/lib/mock-data.ts` morre: dados migram para `src/mocks/*` **já no formato do domínio validado** (AIAnalysis versionada, `cycleId` nullable em venda manual, staff fora de memberships, Membership N:N).

## 3. Estrutura de módulos

Regra mantida: `app → modules → components → lib/hooks/types`; módulo não importa módulo. Novos: **tenancy** (pharmacies, memberships, sessão simulada, switch) e **admin** (visão plataforma). `api.ts` de cada módulo lê de `src/mocks` e expõe funções com a MESMA assinatura que terão com fetch — a Época 2 troca o miolo, não o contrato.

## 4. Estrutura do Design System

- **ui/** = primitivos shadcn puros (sem domínio, sem cor hardcoded fora de tokens).
- **feedback/ · tables/ · charts/ · layout/** = componentes Orbit (marca aplicada, contratos da UX-LIBRARY).
- **modules/*/components/** = composições de domínio (CyclesTable, ReviewCard, InviteDialog).
- Novos a adicionar do shadcn: `slider`, `alert-dialog`, `avatar`, `sheet`, `dropdown-menu` ✓ já existe.
- Tokens: nenhum novo — tudo já em `globals.css`. Proibido hex em componente.

## 5. Convenções de nomenclatura

| Coisa | Convenção | Exemplo |
|---|---|---|
| Arquivos | kebab-case | `tenant-switcher.tsx`, `qr-panel.tsx` |
| Componentes | PascalCase | `TenantSwitcher` |
| Mocks | `<entidade-plural>.mock.ts` | `tracking-links.mock.ts` |
| Funções de api.ts | verbo+domínio | `listCycles`, `getCurrentAnalysis(cycleId)` |
| Enums/labels | UPPER_SNAKE no tipo, label PT em `lib/constants.ts` | `PENDING_REVIEW` → "Pendente de revisão" |
| Rotas | PT-BR kebab | `/escolher-farmacia` |
| Eventos simulados | passado | `saleConfirmed` |
| Variantes Tailwind | mobile-first: base = mobile, `md:`/`xl:` sobem | — |

## 6. Estratégia de mock data

1. **Formato = domínio validado** (DOMAIN-MODEL), não conveniência da UI: análises versionadas (ciclo c-006 com 2 versões: IA 55% + correção humana), venda manual com `conversationCycleId: null`, memberships com 1 convite PENDING, `pharmacies` com 3 tenants (estados WhatsApp: CONNECTED, DOWN, PAIRING).
2. **Sessão simulada** em `session.mock.ts`: `currentUser`, `currentPharmacyId`, `role` — com um **DevSwitcher** discreto (canto da sidebar em dev) para alternar Gerente/Viewer/Staff e testar permissões sem auth.
3. **Mutações** (confirmar venda, corrigir, convidar): estado local React + toast — sem persistência; refresh reseta (aceito na Época 1).
4. Projeções (badges, KPIs, preview do threshold) **calculadas** dos mocks, nunca hardcoded — valida a forma do dado.
5. IDs estáveis e legíveis (`cyc_001`, `sal_1041`, `pha_dsp`) para debugging e links.

## 7. Estratégia de navegação

- Route groups: `(auth)` sem shell · `(dashboard)` shell completo. Admin usa `(dashboard)` com sidebar variante (sessão staff).
- 3 zonas: trabalho=sidebar · identidade=AvatarMenu · tenant=TenantSwitcher.
- Troca de tenant: atualiza `session` simulada → `router.push('/dashboard')` → toast. Nunca preserva rota.
- Voltar nos detalhes: `router.back()` quando houver histórico interno; fallback hierárquico (`/conversas`).
- ⌘K + botão de busca visível na sidebar; `ROUTES` em constants é a única fonte de URLs (zero strings soltas).
- Permissão simulada: helper `can(action)` lido da sessão mock — VIEWER não vê botões de mutação; rotas MANAGER-only redirecionam.

## 8. Estratégia de responsividade

- Mobile-first real: tela nova nasce em 375px, depois `md:` (768 — sidebar 64px, tabelas ainda cards) e `xl:` (1280 — sidebar 240, DataTable).
- Tabela↔cards: par `hidden md:block` / `md:hidden` com **MobileCardList** padronizado (resolve Vendas/Clientes/Usuários/Admin de uma vez).
- Modais → Sheet inferior <768px (shadcn `sheet`); ConfirmationDialog permanece central sempre.
- GlobalBanner colapsa a 1 linha no mobile (expande no toque).
- QR: em <768px mostra aviso "abra no computador" acima do QR.
- Alvos ≥44px; ação primária na zona do polegar nos cards de revisão.

## 9. Estratégia de acessibilidade

- Linhas de DataTable clicáveis: `tabIndex=0` + Enter/Espaço + `aria-label` descritivo (fecha o gap da auditoria).
- Texto auxiliar <14px nunca usa `#A89E99` → `#695C57` (fix de contraste AA).
- ChatTimeline `role="log"` + prefixo sr-only "Cliente:/Farmácia:"; AuditTimeline em `<ol>`.
- GlobalBanner `role="status"` (não alert); countdown do QR anuncia a cada 15s via `aria-live`.
- KPI clicável = `<a>` real com nome acessível ("Ver 1 venda pendente").
- Toda informação por cor tem texto par (ConfidencePill %, deltas com sinal).
- Focus ring laranja visível em tudo; focus trap nos dialogs (Radix ✓); skip-link para `#main`.
- Teclado: C/E/X (fila), ⌘K, Esc fecha overlays, navegação completa sem mouse.

---

## Ordem de implementação (incrementos verificáveis)

1. **Mocks novos** (`src/mocks/*` no formato do domínio) + módulo `tenancy` + sessão simulada + `can()`
2. **Shell**: AvatarMenu, TenantSwitcher, GlobalBanner, busca visível, sidebar admin-variante, 404/error
3. **Rotas novas**: conta/{perfil,seguranca}, escolher-farmacia, admin/farmacias, recuperar-senha, convite/[token]
4. **Configurações novas**: whatsapp (StatusHero+QrPanel), rastreamento (CopyField), ia (ThresholdSlider), auditoria (AuditTimeline)
5. **Confiança**: Modal Corrigir (AIAnalysis v+1), vendas/[id] com trilha, ConfirmationDialog reforçado, badges derivados
6. **Consistência**: DataTable+MobileCardList em Vendas/Clientes/Usuários, filtros/busca funcionais, a11y fixes (contraste, linhas, skip-link)
7. Build + preview em 375/768/1440 por incremento.
