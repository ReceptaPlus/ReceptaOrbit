# Recepta Orbit — Arquitetura (resumo)

> Fonte completa: `Arquitetura Recepta Orbit Desenvolvimento.docx` (Downloads).
> Este protótipo implementa **apenas o frontend** com dados de exemplo (`src/lib/mock-data.ts`).

## Stack (definida no doc)

- Next.js App Router + TypeScript strict + Tailwind CSS
- PostgreSQL + Prisma (futuro)
- Auth.js Credentials + sessão JWT (futuro)
- pg-boss para filas + worker Node.js separado (futuro)
- Evolution API para WhatsApp (futuro)
- Deploy: Docker + Hostinger VPS

## O que este protótipo cobre

| Rota | Tela do doc |
|------|-------------|
| `/login` | Seção 7 — Autenticação (visual apenas) |
| `/app` | Seção 13 — Indicadores de vendas |
| `/app/conversas` | Seção 15 — Listagem (colunas: contato, origem, etapa, status, resultado, valor, última msg, confiança, revisão) |
| `/app/conversas/[id]` | Seção 15 — Detalhe (timeline, resumo IA, origem + evidências, venda associada, correção manual) |
| `/app/vendas` | Seção 16 — Indicadores + listagem com status e confirmação |
| `/app/clientes` | Seção 17 — Listagem consolidada por telefone |
| `/app/clientes/[id]` | Seção 17 — Ficha individual |
| `/app/configuracoes` | Usuários (RBAC seção 6), integrações, farmácia |

## Modelo de dados espelhado nos mocks

Enums do doc reproduzidos em `src/lib/mock-data.ts`:

- `Stage`: NEW, IN_SERVICE, NEEDS_IDENTIFIED, QUOTE_SENT, NEGOTIATION, SALE_CONFIRMED, LOST, UNCLASSIFIED
- `CycleStatus`: OPEN, WAITING_CUSTOMER, WAITING_PHARMACY, CLOSED, ARCHIVED
- `Outcome`: SALE, NO_SALE, ABANDONED, SPAM, SUPPORT, UNKNOWN
- `AttributionSource`: META_ADS, GOOGLE_ADS, INSTAGRAM_ORGANIC, FACEBOOK_ORGANIC, WHATSAPP_ORGANIC, DIRECT, REFERRAL, UNKNOWN
- `AttributionMethod`: PROVIDER_REFERRAL, TRACKING_TOKEN, CLICK_IDENTIFIER, UTM, MANUAL, AI_INFERENCE
- `SaleStatus`: PENDING_REVIEW, CONFIRMED, CANCELLED, REFUNDED
- Roles: RECEPTA_ADMIN, PHARMACY_MANAGER, PHARMACY_VIEWER

Valores monetários em **centavos** (`netAmountCents`), conforme doc.
Confiança da IA exposta em toda classificação (`ConfidencePill`).
Vendas são entidade própria — nunca booleano na conversa.

## Próximas fases (doc, seção 26)

- Fase 0: provas técnicas Evolution API ← **ainda pendente**
- Fase 1: monorepo + Prisma + Auth.js + RBAC
- Fase 2+: ingestão de webhooks, ciclos 24h, IA, atribuição
