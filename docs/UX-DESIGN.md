# Recepta Orbit — UX Design Completo

> Product Design baseado na arquitetura (ciclos de conversa 24h, vendas como entidade, atribuição com confiança, RBAC com 3 papéis).
> Referências: Linear (velocidade/teclado), Stripe (tabelas/detalhe), HubSpot (CRM/timeline), Notion (hierarquia), Vercel (onboarding), Metabase (dashboards).

---

## 1. User Flow Completo

```mermaid
flowchart TD
    A[Acessa app.receptaorbit.com.br] --> B{Tem sessão?}
    B -- Não --> C[Login: usuário + senha]
    C --> D{Credenciais válidas?}
    D -- Não --> C2[Erro inline + rate limit]
    C2 --> C
    D -- Sim --> E{Quantas farmácias?}
    B -- Sim --> E
    E -- "1 (Gerente/Visualizador)" --> G[Dashboard da farmácia]
    E -- "N (Admin Recepta)" --> F[Escolher Farmácia]
    F --> G

    G --> H[Conversas]
    G --> I[Vendas]
    G --> J[Clientes]
    G --> K[Campanhas]
    G --> L[Configurações]

    H --> H1[Detalhe da conversa]
    H1 --> H2{IA classificou certo?}
    H2 -- Não --> H3[Corrigir: etapa/resultado/valor/origem]
    H3 --> H4[Auditoria registrada]
    H2 -- Sim --> H5[Ver venda associada]
    H5 --> I1[Detalhe da venda]

    I --> I2{Pendente de revisão?}
    I2 -- Sim --> I3[Confirmar / Ajustar / Cancelar]
    I3 --> I4[Venda confirmada → entra nos KPIs]
    I2 -- Não --> I1

    J --> J1[Ficha do cliente]
    J1 --> H1

    K --> K1[Campanha → conversas e vendas atribuídas]
    K1 --> H1
```

**Fluxo crítico do dia a dia (loop de revisão):**

```mermaid
flowchart LR
    A[Notificação: 3 vendas pendentes] --> B[Fila de revisão]
    B --> C[Card: conversa + resumo IA + valor sugerido]
    C --> D{Decisão}
    D -- Confirmar --> E[1 clique → próximo card]
    D -- Ajustar valor --> F[Editar inline → confirmar]
    D -- Não foi venda --> G[Marcar NO_SALE + motivo]
    E & F & G --> H{Fila vazia?}
    H -- Não --> C
    H -- Sim --> I[Estado vazio: 'Tudo revisado ✓']
```

> Padrão Linear: revisão em fila com ações de 1 tecla (C = confirmar, E = editar, X = rejeitar), avanço automático.

---

## 2. Sitemap

```mermaid
flowchart TD
    ROOT["/"] --> LOGIN["/login"]
    ROOT --> ORG["/escolher-farmacia (só multi-tenant)"]
    ORG --> APP["/app (shell autenticado)"]

    APP --> DASH["/app — Visão Geral"]
    APP --> CONV["/app/conversas"]
    CONV --> CONVD["/app/conversas/:id"]
    APP --> VEND["/app/vendas"]
    VEND --> VENDD["/app/vendas/:id"]
    VEND --> REV["/app/vendas/revisao (fila)"]
    APP --> CLI["/app/clientes"]
    CLI --> CLID["/app/clientes/:id"]
    APP --> CAMP["/app/campanhas"]
    CAMP --> CAMPD["/app/campanhas/:id"]
    APP --> CONF["/app/configuracoes"]
    CONF --> CU["…/usuarios"]
    CONF --> CI["…/integracoes"]
    CONF --> CF["…/farmacia"]
    CONF --> CA["…/auditoria"]

    LOGIN -.-> RECOVER["/recuperar-senha"]
```

**Visibilidade por papel (RBAC):**

| Rota | Admin Recepta | Gerente | Visualizador |
|---|---|---|---|
| Escolher farmácia | ✅ todas | — (vai direto) | — (vai direto) |
| Dashboard / Conversas / Clientes / Campanhas | ✅ | ✅ | ✅ (somente leitura) |
| Vendas — confirmar/corrigir | ✅ | ✅ | ❌ (vê, não edita) |
| Configurações → Usuários / Integrações | ✅ | ✅ usuários da própria farmácia | ❌ |
| Auditoria | ✅ | ✅ | ❌ |

---

## 3. Navegação Desktop

Padrão **Linear/Notion**: sidebar fixa à esquerda, conteúdo fluido, command palette.

```
┌──────────────┬──────────────────────────────────────────────┐
│ ◉ Recepta    │  Breadcrumb · Busca global (⌘K) · Avatar     │
│   Orbit      ├──────────────────────────────────────────────┤
│              │                                              │
│ ▸ Visão Geral│                                              │
│ ▸ Conversas ③│           ÁREA DE CONTEÚDO                   │
│ ▸ Vendas   ②│                                              │
│ ▸ Clientes   │                                              │
│ ▸ Campanhas  │                                              │
│ ──────────   │                                              │
│ ▸ Configurar │                                              │
│              │                                              │
│ [Farmácia ▾] │  ← seletor de tenant (só Admin Recepta)      │
│ [User · Sair]│                                              │
└──────────────┴──────────────────────────────────────────────┘
```

Regras:
- **Badges numéricos** na sidebar = itens que precisam de ação (conversas a revisar, vendas pendentes). Padrão HubSpot.
- **⌘K / Ctrl+K** command palette: ir para tela, buscar contato por nome/telefone, ações rápidas ("confirmar vendas pendentes"). Padrão Linear/Vercel.
- **Seletor de farmácia** no rodapé da sidebar (Admin Recepta) — troca de tenant sem logout. Padrão Vercel (team switcher).
- Sidebar **240px fixa**; colapsável para 64px (só ícones) em telas 1024–1280px.
- Filtros de listagem ficam na **toolbar da página**, nunca na sidebar (padrão Stripe).

---

## 4. Navegação Mobile

Padrão app-like: **bottom tab bar** com 4 destinos + "Mais".

```
┌──────────────────────────────┐
│ ☰  Visão Geral        🔍  ◉ │   ← topbar: menu, título, busca, avatar
│                              │
│         CONTEÚDO             │
│                              │
├──────────────────────────────┤
│  ⌂      💬      🛒      ⋯   │   ← bottom tabs
│ Geral Conversas Vendas  Mais │
└──────────────────────────────┘
```

- **Geral · Conversas · Vendas** = 3 tarefas de maior frequência. **Mais** abre sheet com Clientes, Campanhas, Configurações, trocar farmácia, sair.
- Badge vermelho no tab Vendas quando há pendências de revisão.
- Tabelas viram **cards empilhados** (1 conversa = 1 card com nome, origem, etapa, valor, hora).
- Detalhe de conversa: timeline em tela cheia; painel de classificação vira **bottom sheet** deslizável (padrão HubSpot mobile).
- Fila de revisão: cards com **swipe** — direita confirma, esquerda rejeita; tap abre detalhe.
- Alvos de toque ≥ 44px; ações primárias na zona do polegar.

---

## 5. Wireframes Low Fidelity

### 5.1 Login
```
┌─────────────────────────────┐
│        ◉ Recepta Orbit      │
│                             │
│   Entre na sua farmácia     │
│   Acesso criado pela equipe │
│                             │
│   Usuário    [___________]  │
│   Senha      [_______] 👁   │
│                             │
│   [        Entrar        ]  │
│      Esqueci minha senha    │
└─────────────────────────────┘
```

### 5.2 Escolher Farmácia (Admin Recepta)
```
┌─────────────────────────────────────┐
│  Suas farmácias            [Buscar] │
│  ┌───────────┐ ┌───────────┐        │
│  │ Drogaria  │ │ Farma     │        │
│  │ São Paulo │ │ Vida      │        │
│  │ 12 pend.  │ │ 0 pend.   │        │
│  └───────────┘ └───────────┘        │
└─────────────────────────────────────┘
```

### 5.3 Dashboard (Visão Geral)
```
┌──────────┬──────────────────────────────────────────┐
│ SIDEBAR  │ Visão Geral          [Período: 14d ▾]    │
│          │ ┌──────┐┌──────┐┌──────┐┌──────┐         │
│          │ │Total ││Ticket││Conv. ││Pend. │ ← KPIs  │
│          │ │vendid││médio ││ %    ││revis.│         │
│          │ └──────┘└──────┘└──────┘└──────┘         │
│          │ ┌────────────────┐┌─────────────────┐    │
│          │ │ Conversas/dia  ││ Top produtos    │    │
│          │ │ ▁▃▅▂▇▅█        ││ 1. ▓▓▓▓▓▓ 38    │    │
│          │ └────────────────┘└─────────────────┘    │
│          │ ┌──────────────────────────────────┐     │
│          │ │ Vendas por origem (Meta/Google…) │     │
│          │ └──────────────────────────────────┘     │
│          │ ┌──────────────────────────────────┐     │
│          │ │ ⚠ 2 vendas aguardam revisão  [→] │     │
│          │ └──────────────────────────────────┘     │
└──────────┴──────────────────────────────────────────┘
```

### 5.4 Conversas (listagem)
```
┌──────────┬──────────────────────────────────────────┐
│ SIDEBAR  │ Conversas    [Período▾][Origem▾][Etapa▾] │
│          │              [Status▾][Só revisão ◻]     │
│          │ ┌──────────────────────────────────────┐ │
│          │ │Contato │Origem│Etapa│Valor│Conf│Hora │ │
│          │ │Maria S.│Meta  │Venda│ 89  │91% │14:51│ │
│          │ │João P. │Google│Orçam│ —   │74% │13:22│ │
│          │ │ ⚠ linha destacada quando needsReview │ │
│          │ └──────────────────────────────────────┘ │
│          │              ‹ 1 2 3 ›  50/página        │
└──────────┴──────────────────────────────────────────┘
```

### 5.5 Detalhe da Conversa (padrão Stripe: timeline + painel)
```
┌──────────┬───────────────────────────┬──────────────┐
│ SIDEBAR  │ ← Conversas               │ CLASSIFICAÇÃO│
│          │ Maria Silva · (11)9****   │ Etapa  [Venda│
│          │ ┌───────────────────────┐ │ Status [Encer│
│          │ │ cliente: Boa tarde... │ │ Valor  R$ 89 │
│          │ │      farmácia: Olá! ▶ │ │ IA: 91% ████ │
│          │ │ cliente: Sim, quero 3 │ │──────────────│
│          │ │      farmácia: Pedido▶│ │ ORIGEM       │
│          │ └───────────────────────┘ │ Meta Ads 97% │
│          │ ┌───────────────────────┐ │ Camp: Genéric│
│          │ │ 🤖 Resumo da IA       │ │──────────────│
│          │ │ "Comprou 3cx dipirona"│ │ VENDA s-1041 │
│          │ └───────────────────────┘ │ [Corrigir]   │
└──────────┴───────────────────────────┴──────────────┘
```

### 5.6 Fila de Revisão de Vendas (padrão Linear: triage)
```
┌──────────┬──────────────────────────────────────────┐
│ SIDEBAR  │ Revisão de vendas              2 restantes│
│          │ ┌──────────────────────────────────────┐ │
│          │ │ Carlos Andrade · Google Ads          │ │
│          │ │ "Antibiótico c/ receita, retirada"   │ │
│          │ │ Valor sugerido: R$ 210,00 (conf. 55%)│ │
│          │ │ [resumo + 3 últimas mensagens]       │ │
│          │ │                                      │ │
│          │ │ [✓ Confirmar] [✎ Ajustar] [✗ Não foi]│ │
│          │ │      C            E           X      │ │
│          │ └──────────────────────────────────────┘ │
│          │         ● ○   (progresso da fila)        │
└──────────┴──────────────────────────────────────────┘
```

### 5.7 Ficha do Cliente (padrão HubSpot: perfil + atividades)
```
┌──────────┬──────────────────────────────────────────┐
│ SIDEBAR  │ ← Clientes                               │
│          │ ◉ Rafael Lima · (11) 9****-5543          │
│          │ ┌─────┐┌─────┐┌─────┐┌─────┐             │
│          │ │Total││Tickt││Conv.││Compr│             │
│          │ │ 521 ││ 74  ││ 12  ││  7  │             │
│          │ └─────┘└─────┘└─────┘└─────┘             │
│          │ ┌─────────────────┐┌────────────────┐    │
│          │ │ Conversas       ││ Compras        │    │
│          │ │ (timeline)      ││ (lista+status) │    │
│          │ └─────────────────┘└────────────────┘    │
└──────────┴──────────────────────────────────────────┘
```

### 5.8 Mobile — Conversas + Revisão
```
┌──────────────┐   ┌──────────────┐
│ Conversas  🔍│   │ Revisar  2/3 │
│ ┌──────────┐ │   │ ┌──────────┐ │
│ │Maria S.  │ │   │ │Carlos A. │ │
│ │Meta·Venda│ │   │ │R$ 210,00 │ │
│ │R$89 14:51│ │   │ │conf. 55% │ │
│ └──────────┘ │   │ │ resumo…  │ │
│ ┌──────────┐ │   │ └──────────┘ │
│ │João P.   │ │   │ ←✗ swipe ✓→ │
│ └──────────┘ │   │              │
├──────────────┤   ├──────────────┤
│ ⌂  💬  🛒  ⋯ │   │ ⌂  💬  🛒  ⋯ │
└──────────────┘   └──────────────┘
```

---

## 6. Jornada do Usuário

**Persona principal: Antonio, gerente de farmácia** (45 anos, usa WhatsApp o dia todo, pouco tempo para "sistema").

```mermaid
journey
    title Jornada diária — Gerente de farmácia
    section Manhã (7h50)
      Abre app no celular: 3: Antonio
      Vê badge "2 vendas a revisar": 4: Antonio
      Revisa fila em 90 segundos (swipe): 5: Antonio
    section Durante o dia
      Cliente liga citando anúncio: 3: Antonio
      Busca contato pelo ⌘K: 5: Antonio
      Vê histórico e última compra na ficha: 5: Antonio
    section Fim do dia (19h)
      Abre Visão Geral no desktop: 4: Antonio
      Compara vendas Meta vs Google: 5: Antonio
      Decide reforçar campanha de genéricos: 5: Antonio
    section Sexta-feira
      IA classificou venda errada: 2: Antonio
      Corrige em 2 cliques com auditoria: 4: Antonio
```

**Momentos-chave e princípios:**

| Momento | Risco | Solução de design |
|---|---|---|
| Primeiro login | Abandono se vazio | Onboarding com dados chegando ao vivo da Evolution API; estado vazio explica "conecte o WhatsApp" com CTA (padrão Vercel) |
| Revisão diária | Virar tarefa chata | Fila gamificada, < 2 min, atalhos de teclado, swipe no mobile |
| IA erra | Perda de confiança | Confiança sempre visível; correção em 2 cliques; "por que classifiquei assim" com evidências |
| Relatório p/ dono | Dado não confiável | KPIs só contam vendas CONFIRMED; pendentes ficam separadas (padrão Metabase: número auditável) |

---

## 7. Componentes Necessários (Design System)

**Fundações** — tokens já definidos: cores da marca (#D4432C primário, #FFF5D9 fundo, #0A0D0C ink), tipografia (Manrope display / Inter texto), espaçamento 4px, raios, sombras.

| Categoria | Componentes | Referência |
|---|---|---|
| **Navegação** | Sidebar (com badges), Bottom tabs, Breadcrumb, Command palette (⌘K), Tenant switcher, Tabs | Linear, Vercel |
| **Dados** | DataTable (ordenável, paginada, linha clicável, coluna fixa), Card-lista mobile, KPI Card (valor + delta), Progress bar, Sparkline/BarChart, EmptyState, Skeleton loading | Stripe, Metabase |
| **Status** | Badge de etapa (8 estados), Badge de status, Badge de resultado, Badge de origem (8 fontes), ConfidencePill (verde ≥85% / âmbar ≥60% / vermelho <60%), Badge "Revisar" | HubSpot |
| **Conversa** | ChatBubble (in/out), Timeline, AISummaryCard, EvidencePanel (origem + método + confiança), Avatar com iniciais | HubSpot, Stripe |
| **Ações** | Button (primary/secondary/ghost/danger), ReviewCard (confirmar/ajustar/rejeitar), InlineEdit (valor R$), SegmentedControl (período 7d/30d/90d), FilterDropdown, SearchInput, DateRangePicker | Linear |
| **Formulários** | Input, PasswordInput, Select, Checkbox, Toggle, FormField (label+erro), validação inline | Stripe |
| **Feedback** | Toast (sucesso/erro), Modal de confirmação (só p/ destrutivo), Banner de alerta (ex: integração caída), Tooltip, AuditTrail (quem mudou o quê) | Notion |
| **Overlay** | Modal, BottomSheet (mobile), Drawer lateral (detalhe rápido sem sair da lista — padrão Linear peek) | Linear |

Regras transversais:
- Dinheiro sempre em **centavos → formatado BRL**, alinhado à direita em tabelas.
- Toda classificação de IA acompanha **ConfidencePill** — nunca número "seco".
- Ação destrutiva (cancelar venda, desconectar integração) exige confirmação; o resto é otimista com toast + desfazer (padrão Linear).
- Telefones sempre mascarados (`(11) 9****-3421`) para Visualizador; completo para Gerente+ (LGPD).

---

## 8. Hierarquia das Telas

```mermaid
flowchart TD
    subgraph N0["Nível 0 — Acesso"]
        L[Login]
        EF[Escolher Farmácia]
    end
    subgraph N1["Nível 1 — Hub"]
        D[Visão Geral<br/>agregados + alertas]
    end
    subgraph N2["Nível 2 — Listagens (tabelas filtráveis)"]
        C[Conversas]
        V[Vendas]
        CL[Clientes]
        CP[Campanhas]
        CF[Configurações]
    end
    subgraph N3["Nível 3 — Detalhe (registro único)"]
        CD[Conversa: timeline+classificação]
        VD[Venda: itens+evidências]
        CLD[Ficha do cliente]
        CPD[Campanha: atribuições]
    end
    subgraph N4["Nível 4 — Ação focada"]
        R[Fila de revisão]
        COR[Correção manual]
        INV[Convidar usuário]
    end

    L --> EF --> D
    D --> C & V & CL & CP & CF
    C --> CD
    V --> VD
    CL --> CLD
    CP --> CPD
    D -- atalho direto --> R
    V --> R
    CD --> COR
    R --> COR
```

**Princípios de hierarquia:**

1. **Hub → Lista → Detalhe → Ação** — nunca mais de 4 níveis; breadcrumb sempre mostra caminho de volta (padrão Notion).
2. **Dashboard é radar, não destino** — todo número clicável leva à listagem já filtrada (padrão Metabase: drill-down).
3. **Detalhe preserva contexto** — abrir conversa a partir da lista pode usar drawer lateral (peek) antes de navegação completa (padrão Linear).
4. **Ações de revisão têm rota própria** (`/app/vendas/revisao`) — linkável, badge na sidebar, vazia = trabalho em dia.
5. **Cross-links em todo registro**: conversa ↔ venda ↔ cliente ↔ campanha são grafos, não silos (padrão HubSpot: objetos associados).
