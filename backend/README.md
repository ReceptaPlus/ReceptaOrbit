# Recepta Orbit — Backend

Pacote Node/TypeScript standalone. Consumido pelo `frontend/` (via `file:../backend`)
quando o Auth.js for ligado. Separado do frontend para organizar e isolar diffs no git.

## Fase 1 — ENTREGUE (fundação)

Escopo (arquitetura §26): PostgreSQL · Prisma · migrations · RBAC · usuários ·
farmácias · memberships · primeiro acesso · termos/privacidade · auditoria.

| Área | Arquivo |
|---|---|
| Schema (8 modelos, snake_case) | `prisma/schema.prisma` |
| Seed (espelha cenários dos mocks) | `prisma/seed.ts` |
| Prisma Client (singleton) | `src/db/client.ts` |
| Env validado (Zod) | `src/config/env.ts` |
| Hash de senha (Argon2id + pepper) | `src/domain/auth/password.ts` |
| RBAC server-side (`can`) | `src/domain/auth/rbac.ts` |
| Convite 1º acesso (token só por hash) | `src/domain/auth/invitations.ts` |
| Contexto de tenant (valida membership) | `src/domain/tenancy/context.ts` |
| Infra local (Postgres) | `docker-compose.yml` |

**Modelos:** `Pharmacy` · `User` (identidade global) · `PlatformStaff` (separado do tenant)
· `Membership` (N:N, UNIQUE(pharmacy,user)) · `UserInvitation` · `LegalDocument` ·
`UserLegalAcceptance` · `AuditLog` (append-only).

> Alinhado a `frontend/src/types/domain.ts` e `docs/DOMAIN-MODEL.md` (congelados):
> roles `OWNER/MANAGER/VIEWER` + `PLATFORM_*`; senha nunca em texto; pharmacyId nunca
> confiado do request (validado em `resolvePharmacyContext`).

## Setup local

```bash
cd backend
cp .env.example .env          # ajuste PASSWORD_PEPPER em produção
npm install
docker compose up -d          # sobe orbit-postgres (porta 5432)
npm run db:migrate            # cria a migration inicial + aplica + roda o seed
npm run db:studio             # (opcional) inspecionar os dados
```

Senha padrão do seed: `Recepta@123` (usuários: antonio/camila/daniel/suporte;
ana = convidada sem 1º acesso).

## Scripts

`db:generate` · `db:migrate` · `db:deploy` (prod) · `db:reset` · `db:seed` ·
`db:studio` · `compose:up` · `compose:down` · `typecheck`.

## Próximos (fora da Fase 1)

- **Auth.js Credentials + sessão JWT** — vive no `frontend/` (route handlers/middleware),
  consome `verifyPassword`/`resolvePharmacyContext` daqui. Exige ler docs do Next 16.
- Fase 2+: WhatsApp/Evolution, contatos, mensagens, ciclos, pg-boss/worker, IA, vendas.
  Pastas `src/{api,jobs,queues,workers,integrations,ai}` já reservadas.

## Pendências técnicas

- `prisma migrate` exige Postgres no ar (Docker). Schema já **validado** (`prisma validate`)
  e client **gerado**; a migration inicial é criada no primeiro `db:migrate`.
- Aviso `package.json#prisma` deprecado → migrar para `prisma.config.ts` no Prisma 7
  (funciona normalmente no Prisma 6 atual).
