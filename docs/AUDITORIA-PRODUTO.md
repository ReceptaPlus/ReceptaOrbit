# Recepta Orbit — Auditoria de Produto, UX, Segurança e Operação

> Estado auditado: protótipo frontend Next.js com dados mockados (`modules/*/api.ts`), sem backend.
> Legenda: ✅ EXISTE · 🟡 EXISTE PARCIALMENTE · ❌ NÃO EXISTE · ➖ NÃO SE APLICA

---

## Matriz de cobertura

### Navegação

| Item | Status | Risco / Impacto / Implementação mínima |
|---|---|---|
| Logo clicável | 🟡 | Marca na sidebar não é link. **Risco:** quebra convenção universal; usuário perde rota de escape. **Mínimo:** envolver brand em `Link` para `/dashboard`. |
| Menu principal | ✅ | Sidebar com 5 itens + estados ativos + badges. |
| Breadcrumbs | 🟡 | Só links "← Voltar" nos detalhes. **Risco:** baixo (hierarquia rasa, 4 níveis). **Mínimo:** breadcrumb em detalhe de conversa/cliente quando vier de cross-link (venda→conversa). |
| Busca global | 🟡 | ⌘K funciona, mas invisível para quem não conhece o atalho; sem botão no mobile. **Impacto:** descoberta ~0 para gerente de farmácia não-técnico. **Mínimo:** botão de busca na sidebar/topbar que abre a palette. |
| Navegação mobile | ✅ | Bottom tabs com badge, safe-area, toque ≥44px. |
| Rodapé | ➖ | App autenticada; rodapé institucional pertence ao site de marketing. |
| Página 404 | 🟡 | Next default (inglês, sem marca). **Risco:** link quebrado joga usuário em tela alienígena. **Mínimo:** `not-found.tsx` com marca + link ao dashboard. |
| Página de manutenção | ❌ | **Risco:** deploy/incidente exibe erro cru do proxy. **Mínimo:** página estática no Nginx/Caddy + `error.tsx` global com marca. |

### Contas e Usuários

| Item | Status | Risco / Impacto / Implementação mínima |
|---|---|---|
| Login | 🟡 | Tela existe; aceita qualquer credencial (mock). **Risco:** nenhum dado real pode entrar no produto até Auth.js + Credentials existir. **Mínimo:** Fase 1 do backend — Auth.js, bcrypt, sessão JWT. |
| Logout | 🟡 | Link "Sair" só navega para /login; sem sessão para destruir. **Mínimo:** signOut() real na Fase 1. |
| Recuperação de senha | 🟡 | Link "Esqueci minha senha" aponta para `#`. **Risco:** suporte vira gargalo (acesso é criado pela equipe Recepta). **Mínimo:** rota `/recuperar-senha` com fluxo por e-mail OU instrução clara "fale com seu contato Recepta" (escopo do doc: acesso gerenciado). |
| Alteração de senha | ❌ | **Mínimo:** seção em Configurações com senha atual + nova (Zod já tem padrão de 8+). |
| Convite de usuário | 🟡 | Botão existe; modal não. Schema `inviteUserSchema` pronto. **Mínimo:** Dialog com RHF usando o schema existente. |
| Primeiro acesso | ❌ | **Risco:** convidado cai num dashboard sem contexto. **Mínimo:** definição de senha no primeiro login + empty state orientando conexão do WhatsApp. |
| Sessões ativas | ❌ | **Risco:** sem revogação de dispositivo perdido. Backend Fase 1+. |
| Histórico de login | 🟡 | Campo `lastLoginAt` exibido na tabela de usuários; sem trilha completa. **Mínimo:** tabela `login_events` no backend. |
| 2FA | ❌ | **Risco:** dados de saúde de clientes finais (LGPD) atrás de senha única. **Impacto:** alto para Admin Recepta (acesso multi-farmácia). **Mínimo:** TOTP para roles Admin/Gerente na Fase 2. |

### Feedback Visual

| Item | Status | Notas |
|---|---|---|
| Loading | 🟡 | `loading.tsx` em conversas/vendas/clientes; detalhes e configurações sem. **Mínimo:** loading.tsx nos segmentos restantes. |
| Skeleton | ✅ | Componente shadcn aplicado nos loading.tsx. |
| Empty States | 🟡 | Fila de revisão ("Tudo revisado ✓") e DataTable ("Nenhum resultado"). Faltam: conversas zeradas (onboarding "conecte o WhatsApp"), cliente sem compras já coberto. **Mínimo:** EmptyState com CTA na primeira execução. |
| Toasts | ✅ | sonner global; usado em revisão e farmácia. |
| Mensagens de erro | 🟡 | Zod inline no form da farmácia; login sem validação; sem `error.tsx`. **Mínimo:** error boundaries por grupo + validação do login com `loginSchema` (já existe). |
| Confirmações destrutivas | ❌ | "Desconectar" integração executa sem confirmar. **Risco:** desconectar WhatsApp = parar ingestão de TODAS as conversas — ação mais destrutiva do produto. **Mínimo:** ConfirmationDialog com nome da integração digitado ou botão duplo. |

### Formulários

| Item | Status | Notas |
|---|---|---|
| Validação | 🟡 | RHF+Zod na farmácia; login e convite pendentes (schemas prontos, não ligados). |
| Máscaras | ❌ | CNPJ valida formato mas não mascara digitação. **Mínimo:** máscara em CNPJ e telefone (input controlado). |
| Upload | ➖ | Nenhum fluxo do escopo exige upload hoje. |
| Autosave | ➖ | Forms curtos; salvar explícito é o correto para dados cadastrais. |

### Busca e Filtros

| Item | Status | Notas |
|---|---|---|
| Busca | 🟡 | ⌘K busca contatos; input de busca em Clientes é decorativo. **Mínimo:** ligar input ao filtro client-side com `useDebounce` (hook pronto). |
| Filtros | 🟡 | Botões "Período/Origem/Etapa…" decorativos em 2 telas. **Risco:** com volume real (>100 ciclos/dia), telas inutilizáveis. **Mínimo:** faceted filter do TanStack (coluna origem/etapa/status). |
| Ordenação | 🟡 | DataTable com sorting em Conversas; Vendas e Clientes ainda em tabela manual. **Mínimo:** migrar as 2 tabelas para DataTable. |

### Comunicação

| Item | Status | Notas |
|---|---|---|
| Notificações internas | 🟡 | Badges na sidebar/tabs hardcoded (2, 1). **Mínimo:** derivar de `countNeedsReview()`/`pendingCount` (funções prontas). |
| E-mail | ❌ | Necessário para convite e recuperação. Backend Fase 1–2 (Resend/SES). |
| Central de suporte | ❌ | **Mínimo:** link "Suporte" no rodapé da sidebar → WhatsApp da Recepta (coerente com o produto). |

### Acessibilidade

| Item | Status | Notas |
|---|---|---|
| Navegação por teclado | 🟡 | ⌘K, atalhos C/X, componentes Radix (focus trap em dialogs). Falta: skip-link, foco visível auditado em linhas de tabela clicáveis (tr com onClick sem role/tabindex). **Mínimo:** `tabIndex`/`onKeyDown` nas linhas ou link interno na célula. |
| Contraste | 🟡 | Ink sobre bege ✓; cinza `#A89E99` sobre branco ≈ 2.6:1 em textos pequenos (falha AA). **Mínimo:** usar `#695C57` para texto auxiliar <14px. |
| Screen readers | 🟡 | aria-labels na navegação, sr-title nos dialogs Radix; tabelas sem `caption`; badges de status sem contexto. **Mínimo:** caption oculto por tabela + aria-label nos pills. |
| Responsividade | ✅ | 4 breakpoints, cards no mobile, verificado em preview. |

### Segurança

| Item | Status | Notas |
|---|---|---|
| HTTPS | ❌ | Sem deploy ainda. **Mínimo:** TLS no proxy desde o primeiro deploy (Caddy = automático). |
| CSRF | ❌ | Sem mutações reais ainda. Auth.js cobre na Fase 1. |
| XSS | 🟡 | React escapa por padrão; conteúdo de mensagens WhatsApp (fonte não confiável) renderizado como texto ✓. Manter proibição de `dangerouslySetInnerHTML`. |
| Rate Limit | ❌ | Crítico no login e no webhook da Evolution. Backend Fase 1–2. |
| Auditoria | ❌ | Correção de classificação e confirmação de venda exigem trilha (quem/quando/o quê) — previsto no doc, não modelado no front. **Mínimo:** registrar autoria nas mutações desde o primeiro endpoint. |
| Logs | ❌ | Sem observabilidade. **Mínimo:** logs estruturados (pino) + Sentry no web e worker. |

### Administração

| Item | Status | Notas |
|---|---|---|
| Gestão de usuários | 🟡 | Listagem ✓; convite sem modal; sem editar/suspender. **Mínimo:** dropdown de ações por linha (suspender/reativar). |
| Gestão de farmácias | ❌ | Tela "Escolher Farmácia" (Admin Recepta) não construída. **Mínimo:** rota com grid de cards + tenant switcher na sidebar. |
| Permissões | 🟡 | Roles tipados (`UserRole`) e exibidos; zero enforcement na UI (Visualizador vê botão Confirmar). **Risco:** ao ligar backend, UI promete ações que a API negará. **Mínimo:** gate de componentes por `useSession().role`. |
| Auditoria | ❌ | Ver Segurança. |

### Mobile

| Item | Status | Notas |
|---|---|---|
| Responsivo | ✅ | |
| PWA | ❌ | Gerente vive no celular — instalável tem valor real. **Mínimo:** manifest + ícones (service worker pode esperar). |

### Histórico

| Item | Status | Notas |
|---|---|---|
| Histórico de alterações | ❌ | AuditTrail por ciclo/venda previsto no UX doc; sem dados. Backend. |
| Auditoria | ❌ | Idem. |
| Histórico de login | 🟡 | Só `lastLoginAt`. |

### Performance

| Item | Status | Notas |
|---|---|---|
| Cache | 🟡 | RSC + prerender estático do Next ✓; TanStack Query configurado (staleTime 30s) aguardando API real. |
| Lazy Loading | 🟡 | Code-splitting por rota (App Router) ✓; Recharts entra no bundle da rota — ok por ora. |
| Core Web Vitals | ❌ | Nunca medido. **Mínimo:** Lighthouse CI ou `@vercel/speed-insights` no deploy. |

### Analytics

| Item | Status | Notas |
|---|---|---|
| Eventos | ❌ | Sem instrumentação. **Mínimo:** PostHog/Clarity com 5 eventos: login, abrir conversa, confirmar venda, corrigir classificação, usar ⌘K. |
| Conversões | ❌ | Funil de revisão (pendente→confirmada) é a métrica do produto. |
| Origem de tráfego | ➖ | App autenticada; relevante só no site de marketing. |

### SEO

| Item | Status | Notas |
|---|---|---|
| Sitemap | ➖ | App privada; só /login é pública. |
| Robots | 🟡 | Sem `robots.txt` — app privada deve ter `Disallow: /`. **Mínimo:** 3 linhas de arquivo. |
| Open Graph | 🟡 | Metadata básica ✓; sem OG image. **Mínimo:** OG no /login (único compartilhável). |

### SaaS

| Item | Status | Notas |
|---|---|---|
| Multi-tenancy | 🟡 | Modelado (Pharmacy 1→N) nos tipos e UML; UI single-tenant mockada. **Risco:** retrofit de tenant é caro — `pharmacy_id` em toda query desde a primeira migration. |
| Convites | 🟡 | Botão + schema; sem fluxo. |
| Equipes | ➖ | Modelo é farmácia→usuários; "equipes" extra está fora do escopo. |
| Permissões | 🟡 | Ver Administração. |
| Logs | ❌ | Ver Segurança. |
| Webhooks | 🟡 | Entrada (Evolution) desenhada na arquitetura; webhooks de saída fora do escopo atual. |

---

## 1. Lacunas críticas (bloqueiam produção)

1. **Autenticação real** — login mock; nada pode ir a produção antes (Auth.js + bcrypt + rate limit no login).
2. **Confirmação destrutiva** — desconectar WhatsApp sem confirmar para a ingestão inteira do tenant.
3. **Enforcement de permissões na UI** — Visualizador vê/aciona ações de Gerente.
4. **Auditoria de mutações** — confirmar/corrigir venda sem trilha compromete a confiança no número (proposta central do produto).
5. **HTTPS + robots Disallow** — desde o primeiro deploy.

## 2. Lacunas importantes (semana seguinte)

6. Filtros e buscas funcionais (hoje decorativos) — TanStack faceted + `useDebounce`.
7. Badges de pendência derivados dos dados (hoje hardcoded).
8. Modal de convite (schema pronto) + validação do login (schema pronto).
9. 404 personalizada + `error.tsx` global.
10. Vendas e Clientes migradas para DataTable (ordenação consistente).
11. Contraste do texto auxiliar (`#A89E99` → `#695C57` em <14px) + linhas de tabela acessíveis por teclado.
12. Botão visível para a busca global (descoberta do ⌘K).

## 3. Melhorias futuras

- 2FA (TOTP) para Admin/Gerente · sessões ativas · alteração de senha
- Tela Escolher Farmácia + tenant switcher (Admin Recepta)
- PWA (manifest) · empty state de onboarding "conecte o WhatsApp"
- Analytics de produto (funil de revisão) · Core Web Vitals no CI
- AuditTrail visível no detalhe da conversa/venda
- Central de suporte via WhatsApp Recepta

## 4. Roadmap por prioridade

| Sprint | Entrega | Itens |
|---|---|---|
| **S1 — Confiável no demo** | UI íntegra | Confirmação destrutiva, filtros/busca reais, badges dinâmicos, modal convite, login validado, 404/error, DataTable em vendas/clientes, fix contraste |
| **S2 — Fundação backend** | Fase 1 do doc | Auth.js + sessão + rate limit, Prisma multi-tenant (`pharmacy_id` em tudo), RBAC na UI e API, auditoria de mutações, HTTPS/robots |
| **S3 — Operação** | Fase 2 do doc | Webhook Evolution + worker, logs estruturados + Sentry, e-mail (convite/recuperação), empty state onboarding |
| **S4 — Maturidade** | Polimento | 2FA, sessões ativas, Escolher Farmácia, PWA, analytics + CWV, AuditTrail na UI |
