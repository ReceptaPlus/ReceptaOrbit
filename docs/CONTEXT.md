# Recepta Orbit — Contexto do Projeto

> **Comece por aqui.** Visão geral, estado atual e ponteiros. Detalhes com valores de dev
> (segredos) ficam em `docs/HANDOFF.md` (gitignored). Este arquivo é seguro p/ commit.
> Última atualização: 2026-06-18.

---

## 1. O que é

SaaS multi-tenant para farmácias. Rastreia conversas de WhatsApp (via Evolution API), agrupa em
ciclos de 24h e mostra indicadores. **Monólito modular:** app Next.js (web + servidor) + worker
Node (async) + PostgreSQL.

### Escopo da 1ª versão (V1 — "espionagem")
Só **monitoramento**: capturar e exibir conversas do WhatsApp.
- **SEM IA** (sem classificação, AIAnalysis, Sale, threshold).
- Dashboard = **métricas de volume**. **Sem tela de vendas.** Atribuição fica `UNKNOWN`.
- IA/vendas/atribuição = versões futuras (o schema deixa a porta aberta).

## 2. Stack

Next.js 16 (App Router) · TypeScript strict · Tailwind v4 · Prisma + PostgreSQL (Railway) ·
sessão JWT nativa (jose) · Argon2id · worker Node (poll) · Evolution API (WhatsApp).
Hospedagem: **tudo na Railway**.

## 3. Estrutura do repo

```
/                     # docs/ na raiz
├─ frontend/          # Next.js full-stack (web + route handlers + server actions)
│  └─ src/{app,modules,components,server,mocks,lib,types}
├─ backend/           # Prisma (dono do schema + migrations) + domínio + worker
│  └─ src/{db,config,domain,worker}
└─ docs/
```
⚠️ **NÃO é monorepo pnpm.** Cada pasta tem seu `package.json`/`node_modules`. O frontend **copia**
o schema do backend (`db:pull-schema` em postinstall/prebuild) e gera o próprio client.

## 4. Decisões travadas (não re-litigar sem motivo)

1. **Auth = JWT nativo (jose)**, não Auth.js. Login real contra Postgres.
2. **Papéis:** tenant `OWNER|MANAGER|VIEWER` (em `Membership`); plataforma `PLATFORM_ADMIN|PLATFORM_SUPPORT` (em `PlatformStaff`). `RECEPTA_ADMIN` **proibido**. User é identidade global.
3. **Multi-tenancy:** shared DB + `pharmacy_id`; nunca vem do request (derivado server-side). FKs compostas `(id, pharmacy_id)` impedem mistura de tenants.
4. **Schema:** dono = backend (`backend/prisma/schema.prisma`); frontend copia.
5. **Deploy:** tudo na Railway (app, worker, Postgres Recepta, Evolution + Postgres/Redis do Evolution).
6. **Ingestão V1:** sem pg-boss — a tabela `WebhookEvent` É a fila (worker faz poll). pg-boss entra com volume.
7. **Ciclo:** status armazenado só `OPEN`/`CLOSED`; `WAITING_*` é derivado na ViewModel (direção da última msg).
8. **Contratos da UI congelados** em `docs/CONTRATOS-FRONTEND.md` — telas consomem ViewModel, não entidade.

## 5. Next.js 16 — gotchas (já tropeçamos)

- `middleware.ts` → **`proxy.ts`** (runtime Node).
- `cookies()`/`headers()`/`params` são **async** (await).
- React Compiler estrito: nada de `setState` em `useEffect`, nem `Date.now()`/`Math.random()` no render.
- Arquivo `"use server"` só exporta funções **async**.
- `serverExternalPackages: ["@prisma/client", "@node-rs/argon2"]`.
- Antes de escrever código Next, ler `frontend/node_modules/next/dist/docs/`.

## 6. Arquitetura de ingestão (V1)

```
WhatsApp → Evolution API → webhook POST /api/webhooks/evolution
   → grava WebhookEvent (raw, PENDING) + responde 202   [frontend]
        ↓ (poll)
   Worker [backend] → resolve tenant (instanceName→Pharmacy)
        → normaliza E.164 → dedup (providerMessageId)
        → upsert Contact → cria Message → abre/anexa ConversationCycle (24h, 1 OPEN/contato)
        → marca WebhookEvent PROCESSED · sweep de ciclos expirados · sync connection.update
```
Arquivos: `frontend/src/app/api/webhooks/evolution/route.ts`, `backend/src/worker/index.ts`,
`backend/src/domain/ingestion/{phone,evolution-payload,ingest}.ts`.

## 7. Evolution / WhatsApp — operação

- Instância `orbit01` vinculada à farmácia `drogaria-sp` (Railway service `evolution`).
- **Gotcha recorrente:** QR não gera / `405 Connection Failure` = `CONFIG_SESSION_PHONE_VERSION` desatualizada. Último valor OK: `2.3000.1035194821`. Atual: `fetchLatestBaileysVersion()` do `baileys`.
- `515` no log = **pareou** (restart normal), não é erro.
- ⚠️ Usar **número dedicado** em produção (risco de ban do número).

## 8. Como rodar (local)

Pré: `backend/.env` e `frontend/.env.local` com `DATABASE_URL`/`DIRECT_DATABASE_URL` (Railway pública,
`?sslmode=require`), `PASSWORD_PEPPER`, `AUTH_SECRET` (frontend). Ver `*.env.example` e HANDOFF §8.

```bash
cd backend  && npm install && npm run db:deploy && npm run db:seed   # banco
cd backend  && npm run worker                                        # worker de ingestão
cd frontend && npm install && npm run dev                            # app
```
Abrir **http://127.0.0.1:3000** (não `localhost` — IPv6 quebra o dev server).
Seed: usuários com senha `Recepta@123` (ver HANDOFF §7).

## 9. Estado atual (2026-06-18)

**Feito:** Fase 1 (auth/tenancy/RBAC/admin/onboarding) · schema V1 aplicado · Evolution pareado ·
**ingestão (webhook + worker) construída e verificada e2e**.

**Falta p/ V1:** camada de dados das telas (mock→Prisma) · telas (whatsapp/conversas/clientes/
dashboard — esperam design) · esconder vendas · deploy Railway (app+worker) · env Evolution no app +
apontar webhook · teste com mensagem real · número dedicado + hardening de segurança.

## 10. Documentos-fonte

- `docs/HANDOFF.md` — estado detalhado + valores de dev (**gitignored**, não commitar).
- `docs/CONTRATOS-FRONTEND.md` — **congelado**: tipos, ViewModels, APIs, `can()`, papéis.
- `docs/DOMAIN-MODEL.md` — bounded contexts, invariantes, regras multi-tenant.
- `docs/ARCHITECTURE.md` · `docs/FRONTEND-ARCHITECTURE.md` · `docs/PLANO-EPOCA-1.md`.
- `AGENTS.md` — ⚠️ Next 16 tem breaking changes; ler os docs do Next antes de codar.
