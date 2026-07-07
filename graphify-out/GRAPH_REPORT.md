# Graph Report - .  (2026-07-07)

## Corpus Check
- 233 files · ~171,546 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1188 nodes · 1976 edges · 104 communities (84 shown, 20 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 105 edges (avg confidence: 0.85)
- Token cost: 455,434 input · 0 output

## Community Hubs (Navigation)
- Auth & App Shell
- Invites & IA API Auth
- Admin Pharmacy Management
- Cycle Data & Formatting
- Message Ingestion Pipeline
- Backend Auth & Seeding
- Backend Package Manifest
- Product & UX Audits
- Domain Type Definitions
- Frontend Package Deps
- Dashboard & Ads Metrics
- Mock Data Fixtures
- Status Labels & Badges
- Command Palette UI
- Design System & Tokens
- Frontend Data Contracts
- Card & Select Primitives
- TypeScript Config (paths)
- shadcn Component Config
- Pharmacy Settings Form
- Pharmacy Users & Context
- Dropdown Menu UI
- TypeScript Config (base)
- Form Field Components
- Table & Button Primitives
- Account Profile & Security
- Tech Stack & Platform
- Config Layout & Chrome
- Conversations List UI
- UI Component Library
- Root Layout & Providers
- Epoca 1 Plan & Mocks
- Frontend Architecture
- Frontend Dev Dependencies
- WhatsApp Settings Panel
- Sales API & Schemas
- Evolution API Client
- Icon Components
- Cycle Detail View
- Brand Logo & Marks
- Brand Photography
- Webhook Route & Secret
- Cycles API
- WhatsApp Server Actions
- RBAC & Permissions
- Visual Specification
- UX Design & IA
- Contacts API
- Shared Label Constants
- User & Membership Domain
- Sales & Tenancy Domain
- Ingestion Architecture V1
- Backend NPM Scripts
- Loading Skeletons
- DB & Audit Utilities
- Internal IA Endpoints
- Attribution & Tracking Domain
- Pharmacy Bounded Contexts
- Conversation Detail Page
- Permissions Contract
- Format Utilities
- Tabs UI
- KPI Card Component
- Message Normalization
- API Response Types
- Root Layout (legacy)
- Brand Components
- WhatsApp Version Script
- Package Metadata
- Revisao Placeholder Page
- Area Chart
- Error Types
- Navigation Zones Strategy
- Next Config & Headers
- Donut Chart
- Keyboard Shortcut Hook
- Account Layout
- Empty State Component
- Sidebar (legacy)
- Data Table (legacy)
- ESLint Config
- PostCSS Config
- Global Search Concept
- IA Config & Tracking Concept
- Customers List Concept
- Module Structure Concept

## God Nodes (most connected - your core abstractions)
1. `cn()` - 78 edges
2. `getAuthorizedPharmacyContext()` - 36 edges
3. `Contratos Frontend (Fonte Unica da Verdade)` - 28 edges
4. `Orbit UI - Biblioteca Oficial` - 23 edges
5. `requireCan()` - 21 edges
6. `scripts` - 17 edges
7. `compilerOptions` - 16 edges
8. `Orbit UI Design System` - 16 edges
9. `can()` - 15 edges
10. `compilerOptions` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Worker Node (poll)` --references--> `Google Ads API`  [INFERRED]
  docs/CONTEXT.md → README.md
- `Hostinger VPS` --semantically_similar_to--> `Railway (hospedagem)`  [INFERRED] [semantically similar]
  README.md → docs/CONTEXT.md
- `pg-boss (filas)` --semantically_similar_to--> `WebhookEvent (fila V1)`  [INFERRED] [semantically similar]
  README.md → docs/CONTEXT.md
- `Worker Node (poll)` --references--> `Meta Graph API`  [INFERRED]
  docs/CONTEXT.md → README.md
- `Google Ads API` --conceptually_related_to--> `Attribution (Value Object)`  [INFERRED]
  README.md → docs/DOMAIN-MODEL.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Pipeline de ingestão V1 (WhatsApp→ciclo)** — docs_context_evolution_api, docs_context_webhook_event, docs_context_worker_node, docs_domain_model_contact, docs_domain_model_message, docs_domain_model_conversation_cycle [EXTRACTED 0.95]
- **Fluxo n8n de análise de IA** — docs_n8n_readme_n8n, docs_n8n_readme_claude, docs_n8n_readme_ia_endpoints, docs_domain_model_conversation_cycle, docs_domain_model_sale [EXTRACTED 0.90]
- **Invariante: venda nasce do ciclo** — docs_domain_model_conversation_cycle, docs_domain_model_ai_analysis, docs_domain_model_sale, docs_domain_model_audit_log [EXTRACTED 0.95]
- **Sistema de permissões RBAC (papel×ação)** — docs_auditoria_produto_enforcement_permissoes, docs_auditoria_saas_separacao_papeis, docs_plano_epoca_1_can_helper, docs_plano_fisico_permissions_matrix [INFERRED 0.80]
- **Pipeline de ingestão agnóstica de provider** — docs_integracao_digisac_webhook_events, docs_integracao_digisac_digisac_payload, docs_integracao_digisac_normalized_message, docs_integracao_digisac_ingest_message, docs_integracao_digisac_channel_connection [EXTRACTED 0.90]
- **Três zonas de navegação (trabalho/identidade/tenant)** — docs_especificacao_funcional_tres_zonas_menu, docs_auditoria_saas_tenant_switcher, docs_auditoria_saas_minha_conta [INFERRED 0.85]
- **Fluxo de dados do detalhe de conversa (dominio -> VM -> componentes)** — docs_contratos_frontend_conversationcycle, docs_contratos_frontend_message, docs_contratos_frontend_aianalysis, docs_contratos_frontend_cycledetailvm, docs_ux_library_chat_timeline, docs_ux_library_confidence_pill [INFERRED 0.85]
- **Linhagem de tokens: marca -> design system -> tailwind -> shadcn** — docs_brand_paleta_principal, docs_design_system_color_tokens, docs_design_system_tailwind_theme, docs_frontend_architecture_shadcn [INFERRED 0.85]
- **Fluxo de revisao de vendas (fila C/E/X -> KPI)** — docs_contratos_frontend_sale, docs_especificacao_visual_fila_revisao, docs_ux_design_loop_revisao, docs_ux_library_kpi_card [INFERRED 0.80]
- **Assets sharing the Recepta red-orange brand palette (#d4432c to #d97055)** — frontend_public_brand_logo_horizontal_gradient, frontend_public_brand_mark_gradient, frontend_public_brand_pattern_t_orange [INFERRED 0.85]
- **Brand Photography Set** — frontend_public_brand_dashboard_banner, frontend_public_brand_login_hero, frontend_public_brand_mark_hero, frontend_public_brand_office, frontend_public_brand_person, frontend_public_brand_pharmacist [INFERRED 0.85]
- **Rx Brand Mark Imagery** — frontend_public_brand_login_hero, frontend_public_brand_mark_hero, frontend_public_brand_person, frontend_public_brand_pharmacist [EXTRACTED 1.00]
- **Orange Brand Palette Imagery** — frontend_public_brand_dashboard_banner, frontend_public_brand_login_hero, frontend_public_brand_mark_hero, frontend_public_brand_office, frontend_public_brand_pharmacist [INFERRED 0.85]

## Communities (104 total, 20 thin omitted)

### Community 0 - "Auth & App Shell"
Cohesion: 0.06
Nodes (48): initialState, LoginForm(), DashboardLayout(), BottomTabs(), TABS, IconCart(), IconChat(), IconDashboard() (+40 more)

### Community 1 - "Invites & IA API Auth"
Cohesion: 0.07
Nodes (37): GET(), POST(), GET(), POST(), extractServiceId(), POST(), secretMatchesHash(), unauthorized() (+29 more)

### Community 2 - "Admin Pharmacy Management"
Cohesion: 0.08
Nodes (35): AdsClientSelect(), ChannelConnect(), Conn, initial, ChurnPharmacyButton(), CreatePharmacyForm(), initialState, AdminFarmaciasPage() (+27 more)

### Community 3 - "Cycle Data & Formatting"
Cohesion: 0.09
Nodes (35): ClientesTable(), tagFor(), ClienteFichaPage(), ClientesPage(), VendasPage(), KpiCard(), KpiCardProps, formatBRL() (+27 more)

### Community 4 - "Message Ingestion Pipeline"
Cohesion: 0.11
Nodes (29): db, globalForPrisma, digisacDate(), extractMessagesDigisac(), isDigisacMessageEvent(), onlyDigits(), extractMessages(), extractText() (+21 more)

### Community 5 - "Backend Auth & Seeding"
Cohesion: 0.09
Nodes (26): main(), prisma, ADMIN_ONLY, APPLY, db, Env, schema, generateInviteToken() (+18 more)

### Community 6 - "Backend Package Manifest"
Cohesion: 0.06
Nodes (34): dependencies, dotenv, @node-rs/argon2, @prisma/client, zod, description, devDependencies, prisma (+26 more)

### Community 7 - "Product & UX Audits"
Cohesion: 0.08
Nodes (31): Auditoria de mutações (trilha quem/quando/o quê), Auditoria de Produto (checklist técnica), Autenticação real (Auth.js + bcrypt + JWT), Confirmação destrutiva (desconectar WhatsApp), Multi-tenancy (pharmacy_id em toda query), Roadmap por prioridade (S1–S4), Auditoria SaaS B2B Multi-tenant, Banner global de integração caída (+23 more)

### Community 8 - "Domain Type Definitions"
Cohesion: 0.07
Nodes (28): ActorRef, AIAnalysis, Attribution, AttributionMethod, AttributionSource, AuditAction, AuditLog, Contact (+20 more)

### Community 9 - "Frontend Package Deps"
Cohesion: 0.07
Nodes (28): dependencies, class-variance-authority, clsx, cmdk, @hookform/resolvers, jose, lucide-react, next (+20 more)

### Community 10 - "Dashboard & Ads Metrics"
Cohesion: 0.15
Nodes (23): AdsCard(), DashboardPage(), money(), nf(), BarChart(), BarChartProps, DashboardVolumeVM, fetchDashboardVolume() (+15 more)

### Community 11 - "Mock Data Fixtures"
Cohesion: 0.08
Nodes (21): AttributionMethod, AttributionSource, Contact, ConversationCycle, CycleStatus, dashboard, IdentificationSource, Message (+13 more)

### Community 12 - "Status Labels & Badges"
Cohesion: 0.14
Nodes (16): METHOD_LABEL, OUTCOME_LABEL, ROLE_LABEL, SALE_STATUS_LABEL, SOURCE_LABEL, STAGE_LABEL, STATUS_LABEL, Attribution (+8 more)

### Community 13 - "Command Palette UI"
Cohesion: 0.12
Nodes (18): PAGES, Command(), CommandDialog(), CommandEmpty(), CommandGroup(), CommandInput(), CommandItem(), CommandList() (+10 more)

### Community 14 - "Design System & Tokens"
Cohesion: 0.14
Nodes (20): Conceito 'A Receita para Crescer', Cores de Apoio, Iconografia preenchida, Identidade Verbal, Logotipo Recepta, Recepta Brand Manual, Paleta Principal, Tipografia Nexa/Montserrat (+12 more)

### Community 15 - "Frontend Data Contracts"
Cohesion: 0.18
Nodes (20): can()/Action (contrato de permissao), Contact, ContactRowVM, DashboardVM, Membership, Contratos de Mocks, Money (Value Object), Pharmacy (tenant) (+12 more)

### Community 16 - "Card & Select Primitives"
Cohesion: 0.17
Nodes (15): Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle(), SelectContent() (+7 more)

### Community 17 - "TypeScript Config (paths)"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 18 - "shadcn Component Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 19 - "Pharmacy Settings Form"
Cohesion: 0.15
Nodes (13): FarmaciaForm(), initialState, PharmacyFormState, updatePharmacyAction(), InviteUserInput, inviteUserSchema, PharmacyInput, pharmacySchema (+5 more)

### Community 20 - "Pharmacy Users & Context"
Cohesion: 0.21
Nodes (13): FarmaciaPage(), ROLE_LABEL, ROLE_STYLE, STATUS_LABEL, STATUS_STYLE, UsuariosPage(), getPharmacyVM(), listPharmacyUsersVM() (+5 more)

### Community 21 - "Dropdown Menu UI"
Cohesion: 0.12
Nodes (9): DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+1 more)

### Community 22 - "TypeScript Config (base)"
Cohesion: 0.13
Nodes (14): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, noEmit, resolveJsonModule (+6 more)

### Community 23 - "Form Field Components"
Cohesion: 0.19
Nodes (12): react, FormControl(), FormDescription(), FormFieldContext, FormFieldContextValue, FormItem(), FormItemContext, FormItemContextValue (+4 more)

### Community 24 - "Table & Button Primitives"
Cohesion: 0.21
Nodes (12): DataTable(), DataTableProps, Button(), buttonVariants, Table(), TableBody(), TableCaption(), TableCell() (+4 more)

### Community 25 - "Account Profile & Security"
Cohesion: 0.16
Nodes (7): ChangePasswordInput, changePasswordSchema, ProfileInput, profileSchema, MembershipItemVM, SecurityVM, UserProfileVM

### Community 26 - "Tech Stack & Platform"
Cohesion: 0.18
Nodes (14): Regra: Next.js com breaking changes, orbit-postgres (serviço Docker), Auth.js Credentials + JWT, Argon2id (hash de senha), JWT nativo (jose), Next.js 16 App Router, PostgreSQL, Prisma ORM (+6 more)

### Community 27 - "Config Layout & Chrome"
Cohesion: 0.15
Nodes (6): ConfiguracoesLayout(), TABS, Badge(), badgeVariants, Input(), TooltipContent()

### Community 28 - "Conversations List UI"
Cohesion: 0.23
Nodes (10): ConversasPage(), FilterKey, FILTERS, StatusBadge(), WaitingBadge(), ROUTES, columns, CyclesTable() (+2 more)

### Community 29 - "UI Component Library"
Cohesion: 0.18
Nodes (12): Providers (Query/Command/Toast), Command Palette (Cmd+K), Confirmation Dialog, Empty State, Error State, Modal (Dialog), Multi Select, Orbit UI - Biblioteca Oficial (+4 more)

### Community 30 - "Root Layout & Providers"
Cohesion: 0.21
Nodes (7): sonner, metadata, montserrat, poppins, Toaster(), Providers(), QueryProvider()

### Community 31 - "Epoca 1 Plan & Mocks"
Cohesion: 0.22
Nodes (11): Enforcement de permissões na UI (RBAC), Backlog priorizado por Época (1–5), Helper can(action) (permissão simulada), DevSwitcher (alterna papel/farmácia em dev), Estratégia de mock data (formato do domínio), Época 1 — Plano Técnico (shell + DS + mocks), contracts/ (tipos congelados), mocks/ (única fonte de dado falso, 13 arquivos) (+3 more)

### Community 32 - "Frontend Architecture"
Cohesion: 0.22
Nodes (11): CycleRowVM, Regras de dependencia de modulos, Estrutura de pastas, Hooks genericos, Arquitetura Frontend Next.js 15, Recharts, shadcn/ui, TanStack Table (+3 more)

### Community 33 - "Frontend Dev Dependencies"
Cohesion: 0.18
Nodes (11): devDependencies, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, @types/node, @types/pg (+3 more)

### Community 34 - "WhatsApp Settings Panel"
Cohesion: 0.29
Nodes (8): WhatsAppConfigPage(), STATE_LABEL, STATE_STYLE, WhatsAppPanel(), getWhatsAppStatusVM(), LABEL, WhatsAppState, WhatsAppStatusVM

### Community 35 - "Sales API & Schemas"
Cohesion: 0.24
Nodes (8): sales, getSalesKpis(), listPendingSales(), listSales(), ConfirmSaleInput, confirmSaleSchema, RejectSaleInput, rejectSaleSchema

### Community 36 - "Evolution API Client"
Cohesion: 0.35
Nodes (10): call(), connectInstance(), ensureInstance(), getConnectionState(), logoutInstance(), mapState(), PairingResult, setWebhook() (+2 more)

### Community 38 - "Cycle Detail View"
Cohesion: 0.29
Nodes (10): ActorRef, AIAnalysis, Attribution (VO-snapshot), AuditLog, ConversationCycle, CycleDetailVM, Message, Audit Timeline (+2 more)

### Community 39 - "Brand Logo & Marks"
Cohesion: 0.29
Nodes (10): Recepta Brand Gradient (#d4432c to #d97055), Recepta Horizontal Logo (Gradient), Recepta Horizontal Logo (White), Recepta Brand Mark (Gradient), Recepta Brand Mark (White), Recepta T-Pattern Background (Cream), Recepta T-Pattern Background (Orange), Recepta Brand Mark (Symbol) (+2 more)

### Community 40 - "Brand Photography"
Cohesion: 0.42
Nodes (10): Brand Photography, Dashboard Banner - Woman with Supplement Bottle, Login Hero - Rx / t / Cross Keycaps, Mark Hero - Floating Rx / t / Cross Cubes, Office - Modern Meeting Room with Orange Accent, Orange Brand Palette, Person - Laughing Woman in Rx Branded Tee, Pharmacist - Woman Holding Rx Box in Pharmacy (+2 more)

### Community 41 - "Webhook Route & Secret"
Cohesion: 0.31
Nodes (7): POST(), secretMatches(), unauthorized(), EvolutionConfig, getWebhookSecret(), getWebhookSetup(), WebhookSetup

### Community 42 - "Cycles API"
Cohesion: 0.24
Nodes (7): conversationCycles, countNeedsReview(), getCycle(), listCycles(), CorrectionInput, correctionSchema, ConversationCycle

### Community 43 - "WhatsApp Server Actions"
Cohesion: 0.38
Nodes (9): disconnectAction(), PairingState, resolveInstanceName(), startPairingAction(), SyncState, syncStateAction(), can(), writeAudit() (+1 more)

### Community 44 - "RBAC & Permissions"
Cohesion: 0.22
Nodes (8): MANAGER, OWNER, PERMISSIONS, PLATFORM_ADMIN, PLATFORM_SUPPORT, VIEWER, Action, SessionRole

### Community 45 - "Visual Specification"
Cohesion: 0.25
Nodes (9): WhatsAppConnection, Vocabulario unificado 'Corrigir', GlobalBanner, Especificacao Visual Definitiva, QrPanel/StatusHero, TenantSwitcher, ThresholdSlider, User Flows (+1 more)

### Community 46 - "UX Design & IA"
Cohesion: 0.28
Nodes (9): Information Architecture, Rotas / route groups, UX Design Completo, Hierarquia Hub->Lista->Detalhe->Acao, Loop de revisao (fila C/E/X), Navegacao Mobile (bottom tabs), Persona Antonio (gerente de farmacia), RBAC - visibilidade por papel (+1 more)

### Community 47 - "Contacts API"
Cohesion: 0.33
Nodes (6): contacts, AttributionSource, getContact(), listContacts(), Contact, Sale

### Community 48 - "Shared Label Constants"
Cohesion: 0.22
Nodes (8): METHOD_LABEL, OUTCOME_LABEL, ROLE_LABEL, ROUTES, SALE_STATUS_LABEL, SOURCE_LABEL, STAGE_LABEL, STATUS_LABEL

### Community 49 - "User & Membership Domain"
Cohesion: 0.29
Nodes (8): LegalDocument (modelo Prisma), UserInvitation (modelo Prisma), UserLegalAcceptance (modelo Prisma), Invite, Membership (Aggregate Root), PlatformStaff, Session, User (Aggregate Root)

### Community 50 - "Sales & Tenancy Domain"
Cohesion: 0.32
Nodes (8): RBAC server-side (can), Multi-tenancy (shared DB + pharmacy_id), FKs compostas (id, pharmacy_id), Contact (Aggregate Root), Money (VO), PhoneE164 (VO), Sale (Aggregate Root), SaleItem (entidade interna)

### Community 51 - "Ingestion Architecture V1"
Cohesion: 0.32
Nodes (8): Evolution API (WhatsApp), Arquitetura de ingestão V1, WebhookEvent (fila V1), Worker Node (poll), Message (entidade imutável), WhatsAppInstance, Meta Graph API, pg-boss (filas)

### Community 52 - "Backend NPM Scripts"
Cohesion: 0.25
Nodes (8): scripts, build, db:pull-schema, dev, lint, postinstall, prebuild, start

### Community 54 - "DB & Audit Utilities"
Cohesion: 0.32
Nodes (4): MarkConversationRead(), markConversationReadAction(), AuditInput, globalForPrisma

### Community 55 - "Internal IA Endpoints"
Cohesion: 0.33
Nodes (7): Zod (validação de env), AIAnalysis (entidade versionada), Confidence (VO), Claude (classificação IA), Endpoints internos IA (/api/internal/ia), Idempotência (upsert cycleId,pharmacyId), n8n (automação IA)

### Community 56 - "Attribution & Tracking Domain"
Cohesion: 0.38
Nodes (7): Ciclo de conversa 24h, Attribution (Value Object), Campaign, ConversationCycle (Aggregate Root), CycleWindow (VO), TrackingLink (Aggregate Root), Google Ads API

### Community 57 - "Pharmacy Bounded Contexts"
Cohesion: 0.29
Nodes (7): ActorRef (VO), AuditLog (AR imutável), Bounded Contexts, CNPJ (VO), Eventos de domínio, Pharmacy (Aggregate Root), Integration

### Community 58 - "Conversation Detail Page"
Cohesion: 0.33
Nodes (5): ConversaDetalhePage(), METHOD_LABEL, SOURCE_LABEL, ConfidencePill(), getConversationVM()

### Community 60 - "Permissions Contract"
Cohesion: 0.43
Nodes (4): Action, can(), MATRIX, UIState

### Community 62 - "Tabs UI"
Cohesion: 0.40
Nodes (5): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

### Community 63 - "KPI Card Component"
Cohesion: 0.33
Nodes (4): arrow, deltaTone, Direction, KpiCardProps

### Community 64 - "Message Normalization"
Cohesion: 0.40
Nodes (5): ConversationCycle (janela 24h) vs ticket Digisac, Normalizador digisac-payload.ts, ingestMessage (ingestão agnóstica de provider), Contrato NormalizedMessage (a 'cola'), webhook_events (fila durável genérica)

### Community 65 - "API Response Types"
Cohesion: 0.40
Nodes (4): ApiError, ApiResponse, ApiResult, Paginated

### Community 66 - "Root Layout (legacy)"
Cohesion: 0.40
Nodes (3): metadata, montserrat, poppins

### Community 68 - "WhatsApp Version Script"
Cohesion: 0.67
Nodes (3): fromGithub(), main(), SOURCES

### Community 69 - "Package Metadata"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 74 - "Navigation Zones Strategy"
Cohesion: 0.67
Nodes (3): Minha Conta (identidade pessoal × tenant), Três zonas de menu (trabalho/identidade/tenant), Estratégia de navegação (route groups, 3 zonas)

## Knowledge Gaps
- **384 isolated node(s):** `name`, `version`, `private`, `type`, `description` (+379 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Card & Select Primitives` to `Command Palette UI`, `Dropdown Menu UI`, `Loading Skeletons`, `Form Field Components`, `Table & Button Primitives`, `Config Layout & Chrome`, `Tabs UI`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Frontend Package Deps` to `Package Metadata`, `Root Layout & Providers`, `Form Field Components`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `react` connect `Form Field Components` to `Frontend Package Deps`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Contratos Frontend (Fonte Unica da Verdade)` (e.g. with `Vocabulario unificado 'Corrigir'` and `modules/*/api.ts (camada de dados)`) actually correct?**
  _`Contratos Frontend (Fonte Unica da Verdade)` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _388 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Auth & App Shell` be split into smaller, more focused modules?**
  _Cohesion score 0.059395801331285206 - nodes in this community are weakly interconnected._
- **Should `Invites & IA API Auth` be split into smaller, more focused modules?**
  _Cohesion score 0.07239819004524888 - nodes in this community are weakly interconnected._