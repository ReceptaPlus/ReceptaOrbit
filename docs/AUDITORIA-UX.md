# Recepta Orbit — Auditoria de UX por Tela

> UX Lead · SaaS B2B. Persona primária: gerente de farmácia (não-técnico, mobile-first, 2 min de atenção).
> Avalia o que existe no protótipo e o que cada tela precisa para operação real.

---

## 1. Dashboard (`/dashboard`)

**1. Objetivo do usuário** — Em 10 segundos: "quanto vendi, de onde veio, o que preciso resolver agora?"
**2. Informações necessárias** — Total vendido (só CONFIRMED), ticket médio, conversão, pendências de revisão, conversas/dia, top produtos, vendas por origem, últimas conversas.
**3. Componentes** — KpiCard ×4, BarChart, ProgressList, SourceCards, lista de conversas recentes, seletor de período.
**4. Estados vazios** — Primeira execução sem dados: hoje mostraria zeros mudos. Necessário EmptyState de onboarding: "Conecte o WhatsApp para começar a ver suas conversas aqui" + CTA → Integrações.
**5. Estados de erro** — Sem `error.tsx`. Necessário: erro de carregamento com retry; KPI individual com falha mostra "—" + tooltip, nunca quebra a grade.
**6. Estados de carregamento** — Sem `loading.tsx` neste segmento (gap). Skeleton da grade KPI + retângulos dos gráficos.
**7. Ações principais** — Clicar KPI pendências → fila de revisão (existe ✓). Cada KPI deve fazer drill-down para listagem filtrada (só pendências faz hoje).
**8. Ações secundárias** — Trocar período (decorativo hoje), abrir conversa recente (existe ✓).
**9. Mobile** — KPIs 2×2, gráficos empilhados, conversas recentes como cards (existe ✓). Período como segmented control rolável.
**10. Acessibilidade** — Gráfico Recharts sem descrição textual: adicionar resumo sr-only ("162 conversas no pico, dia 14"). Deltas coloridos precisam de texto, não só cor (já têm ✓).

**Wireframe**
```
┌ Visão Geral ─────────────────── [Período 14d ▾] ┐
│ [Total R$327 +12%][Ticket R$81][Conv 57%][⚠ 1→] │
│ ┌ Conversas/dia (barras) ┐ ┌ Top produtos ────┐ │
│ └────────────────────────┘ └──────────────────┘ │
│ ┌ Vendas por origem: Meta | Google | IG | WA ──┐ │
│ ┌ Conversas recentes (5) ──────────── Ver todas┐ │
└──────────────────────────────────────────────────┘
```

---

## 2. Conversas (`/conversas` + detalhe)

**1. Objetivo** — Lista: achar a conversa que precisa de atenção. Detalhe: entender o que houve e validar/corrigir a leitura da IA.
**2. Informações** — Contato, origem+confiança, etapa, status, resultado, valor, última msg, flag revisão; no detalhe: timeline completa, resumo IA, evidências de atribuição, venda associada.
**3. Componentes** — DataTable (✓), filtros facetados (decorativos), mobile cards (✓); detalhe: ChatTimeline (✓), painel de classificação (✓), EvidencePanel (✓), botão corrigir (✓ sem ação).
**4. Estados vazios** — Sem conversas: onboarding (conectar WhatsApp). Filtro sem resultado: "Nenhuma conversa com esses filtros" + limpar filtros (DataTable tem genérico ✓).
**5. Estados de erro** — Conversa inexistente → `notFound()` (✓ usa 404 default — personalizar). Falha de carregamento → retry.
**6. Carregamento** — `loading.tsx` na lista ✓; detalhe sem (gap): skeleton de bolhas + painel.
**7. Ações principais** — Abrir conversa (✓ linha clicável), corrigir classificação (botão sem modal — gap crítico do fluxo de confiança).
**8. Ações secundárias** — Filtrar por revisão, ver venda associada (✓), ir à ficha do cliente (gap: nome no detalhe não linka).
**9. Mobile** — Cards ✓; detalhe: painel de classificação deve virar bottom sheet (hoje empilha abaixo da timeline — aceitável, sheet é refinamento).
**10. Acessibilidade** — Linhas clicáveis sem suporte a teclado (tr onClick); timeline precisa de `role="log"` e direção anunciada ("Cliente disse… / Farmácia respondeu…").

**Wireframe (detalhe)**
```
┌ ← Conversas                    [Corrigir class.] ┐
│ Maria Silva · (11)9****-3421                     │
│ ┌ Timeline ────────────┐ ┌ Classificação ──────┐ │
│ │ ◖ cliente 14:42      │ │ Etapa  [Venda conf.]│ │
│ │      farmácia 14:43 ◗│ │ Valor  R$ 89 · 91%  │ │
│ │ ◖ cliente 14:45      │ ├ Origem ─────────────┤ │
│ │ 🤖 Resumo da IA      │ │ Meta Ads 97% · Camp.│ │
│ └──────────────────────┘ │ Venda S-1041 → ─────┘ │
└──────────────────────────────────────────────────┘
```

---

## 3. Clientes (`/clientes` + ficha)

**1. Objetivo** — Lista: localizar cliente por nome/telefone. Ficha: contexto completo antes de atender ("quem é, o que compra, quanto vale").
**2. Informações** — Nome, telefone mascarado por role, nº conversas, nº compras, total, ticket, origens recorrentes; ficha: KPIs do cliente, histórico de conversas e compras, observações.
**3. Componentes** — Tabela (manual — migrar p/ DataTable), SearchInput (decorativo — gap), Avatar, SourceBadges; ficha: KpiCard ×4, duas listas cronológicas.
**4. Estados vazios** — Sem clientes: "Clientes aparecem aqui quando conversarem com a farmácia". Busca sem hit: "Nenhum cliente para 'x'" + limpar. Ficha sem compras: texto existente ✓.
**5. Erros** — Cliente inexistente → notFound ✓; falha → retry.
**6. Carregamento** — loading.tsx na lista ✓; ficha sem (gap).
**7. Ações principais** — Buscar (ligar ao filtro), abrir ficha ✓, abrir conversa a partir da ficha ✓.
**8. Secundárias** — Ordenar por total/última interação (vem com DataTable), exportar (fora de escopo atual).
**9. Mobile** — Tabela vira cards (gap — padrão já existe em Conversas, replicar). Ficha empilha ✓.
**10. Acessibilidade** — Telefones mascarados lidos como "9 asterisco…" — aria-label "telefone parcial". Busca precisa de `role="searchbox"` + resultado anunciado.

---

## 4. Vendas (`/vendas` + `/vendas/revisao`)

**1. Objetivo** — Lista: conferir números e achar pendências. Fila: zerar revisões em <2 min.
**2. Informações** — Cliente, data, origem, campanha, produtos, valor, status, fonte de identificação, confiança; fila: card único com tudo + 3 últimas mensagens (gap: hoje só resumo).
**3. Componentes** — KPIs ✓, tabela (manual — migrar), botão Confirmar inline ✓; fila: ReviewCard ✓, atalhos C/E/X (C/X ✓, E sem ação), dots de progresso ✓, toast ✓.
**4. Estados vazios** — Fila vazia: "Tudo revisado ✓" ✓ (referência do produto). Lista sem vendas: "Vendas identificadas aparecem aqui".
**5. Erros** — Confirmação que falha → toast de erro + item volta à fila (definir na integração real).
**6. Carregamento** — loading.tsx ✓; ação de confirmar deve ter estado pending no botão (gap quando houver API).
**7. Ações principais** — Confirmar (✓ fila e lista), rejeitar com motivo (fila ✓ sem captura de motivo — schema `rejectSaleSchema` pronto, ligar select de motivo).
**8. Secundárias** — Ajustar valor (botão sem ação — ligar `MoneyInput`), ver conversa ✓.
**9. Mobile** — Fila: swipe direita/esquerda (gap — refinamento); botões empilhados ✓. Lista vira cards (gap).
**10. Acessibilidade** — Atalhos de teclado anunciados visualmente (✓ letras nos botões); dots de progresso precisam de `aria-label="2 de 3 revisadas"`; foco deve ir ao próximo card após ação.

**Wireframe (fila)**
```
┌ ← Vendas      Revisão de vendas      2 restantes ┐
│ ┌ Carlos Andrade · Google Ads · [Marca Inst.] ─┐ │
│ │ Sugerido: R$ 210,00  [55%]                   │ │
│ │ 1× Manipulado (antibiótico)                  │ │
│ │ "Cliente foi à loja retirar antibiótico…"    │ │
│ │ Ver conversa completa →                      │ │
│ │ [✓ Confirmar C] [✎ Ajustar E] [✗ Não foi X]  │ │
│ └──────────────────────────────────────────────┘ │
│                    ● ○                           │
└──────────────────────────────────────────────────┘
```

---

## 5. Configurações (`/configuracoes/*`)

**1. Objetivo** — Gerente: convidar equipe, conferir integrações, manter cadastro. Tarefa rara — clareza > densidade.
**2. Informações** — Usuários (nome/email/papel/status/último acesso), integrações (status + detalhe técnico mínimo), dados da farmácia.
**3. Componentes** — Tabs de seção ✓, tabela de usuários ✓, IntegrationCard ✓, form RHF+Zod ✓, Dialog de convite (gap).
**4. Estados vazios** — Um usuário só: "Convide sua equipe" inline. Integração desconectada já comunica ✓.
**5. Erros** — Validação inline ✓ (CNPJ); falha de salvamento → toast erro mantendo dados no form.
**6. Carregamento** — Sem loading.tsx (gap leve — dados pequenos); botão Salvar com pending state quando houver API.
**7. Ações principais** — Convidar (gap: modal), salvar farmácia ✓, conectar/desconectar (gap: confirmação destrutiva no desconectar — crítica).
**8. Secundárias** — Suspender/reativar usuário (gap: menu de ações por linha), reenviar convite (futuro).
**9. Mobile** — Tabs roláveis ✓, tabela de usuários vira lista de cards (gap), form 1 coluna ✓.
**10. Acessibilidade** — Tabs com `aria-current` via link ativo ✓; toggle de integração precisa comunicar estado no texto (✓ badge "Conectado"); inputs com label ✓ (shadcn Form).

---

## 6. Administração (Admin Recepta — Escolher Farmácia + tenant)

> Tela definida no UX-DESIGN, **não construída**. Auditoria do que deve existir.

**1. Objetivo** — Admin Recepta escolhe em qual farmácia operar e detecta qual precisa de atenção.
**2. Informações** — Nome da farmácia, pendências de revisão, conversas do dia, status da integração WhatsApp.
**3. Componentes** — Grid de cards, busca, TenantSwitcher persistente na sidebar.
**4. Estados vazios** — Sem farmácias: CTA interno de provisionamento.
**5. Erros** — Farmácia com integração caída: badge de alerta no card (triagem de suporte).
**6. Carregamento** — Skeleton de grid.
**7. Ações principais** — Entrar na farmácia (card inteiro clicável).
**8. Secundárias** — Trocar de farmácia sem logout (switcher), buscar.
**9. Mobile** — Cards 1 coluna; switcher no menu "Mais".
**10. Acessibilidade** — Cards como links reais (não div+onClick); contagem de pendências em texto.

---

## Gaps transversais priorizados

1. **Fluxo "Corrigir classificação"** sem modal — é o mecanismo de confiança na IA (core do produto).
2. Filtros/busca decorativos em todas as listas.
3. Mobile cards só em Conversas — replicar em Vendas/Clientes/Usuários.
4. `loading.tsx` ausente em detalhes e dashboard.
5. Linhas de tabela clicáveis inacessíveis por teclado.
6. Confirmação destrutiva (desconectar integração).
