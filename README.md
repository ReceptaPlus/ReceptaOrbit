# Recepta Orbit

Sistema de gerenciamento de dados e dashboard de informações em tempo real para farmácias — protótipo frontend (Next.js App Router + TypeScript + Tailwind CSS v4) com dados de exemplo.

> "A receita certa para farmácias."

## Rodando

```bash
npm install
npm run dev
```

Abra **http://localhost:3000** — qualquer usuário/senha entra (login visual, sem backend).

## Telas

| Rota | Descrição |
|------|-----------|
| `/login` | Autenticação (visual) |
| `/app` | Visão Geral — KPIs, conversas/dia, top produtos, vendas por origem |
| `/app/conversas` | Ciclos de conversa 24h com etapa, status, atribuição e confiança da IA |
| `/app/conversas/[id]` | Timeline de mensagens + classificação + evidências de origem |
| `/app/vendas` | Vendas identificadas (IA/manual/integração) com fila de revisão |
| `/app/clientes` | Contatos consolidados por telefone |
| `/app/clientes/[id]` | Ficha com histórico de conversas e compras |
| `/app/configuracoes` | Usuários (RBAC), integrações, dados da farmácia |

## Estrutura

```
src/
├── app/             # rotas (App Router)
├── components/      # sidebar, bottom-tabs, icons (preenchidos), badges
└── lib/mock-data.ts # dados de exemplo — modelo da arquitetura
docs/
├── ARCHITECTURE.md  # resumo da arquitetura (fonte: docx)
├── DESIGN-SYSTEM.md # tokens derivados do manual da marca
└── UX-DESIGN.md     # user flow, sitemap, wireframes, jornada
```

## Design

Manual da marca Recepta aplicado: bege `#FFF5D9` como base (40–50%), laranja `#D4432C` em ação/destaque (20–25%), verde `#6FAF8F` apenas funcional, degradês `#D4432C→#D97055`, Montserrat (corpo) + Poppins (títulos, substituta web da Nexa), ícones preenchidos de cantos arredondados.

Responsivo: sidebar 240px (desktop) → 64px (tablet) → bottom tabs (mobile).

## Arquitetura e Modelagem

Modelagem UML do sistema (Mermaid — renderiza direto no GitHub).

### 1. Diagrama de Casos de Uso

```mermaid
flowchart LR
    GERENTE(["👤 Gerente"])
    VIEWER(["👤 Visualizador"])
    ADMIN(["👤 Admin Recepta"])
    EVO(["⚙ Evolution API"])
    IA(["⚙ Serviço de IA"])

    subgraph Sistema["Recepta Orbit"]
        UC1([Autenticar-se])
        UC2([Visualizar dashboard])
        UC3([Consultar conversas])
        UC4([Corrigir classificação])
        UC5([Revisar venda pendente])
        UC6([Confirmar / rejeitar venda])
        UC7([Consultar ficha do cliente])
        UC8([Gerenciar usuários])
        UC9([Conectar integrações])
        UC10([Trocar de farmácia])
        UC11([Ingerir mensagens WhatsApp])
        UC12([Classificar ciclo e atribuir origem])
    end

    GERENTE --> UC1 & UC2 & UC3 & UC4 & UC5 & UC7 & UC8 & UC9
    UC5 -.->|include| UC6
    VIEWER --> UC1 & UC2 & UC3 & UC7
    ADMIN --> UC1 & UC8 & UC9 & UC10
    EVO --> UC11
    IA --> UC12
    UC11 -.->|trigger| UC12
```

### 2. Diagrama de Classes

```mermaid
classDiagram
    class Pharmacy {
        +id: string
        +tradeName: string
        +cnpj: string
        +timezone: string
    }
    class User {
        +id: string
        +name: string
        +email: string
        +role: UserRole
        +status: UserStatus
        +lastLoginAt: DateTime
    }
    class Contact {
        +id: string
        +name: string
        +phoneE164: string
        +firstSeenAt: DateTime
        +totalSpentCents: int
        +purchaseCount: int
    }
    class ConversationCycle {
        +id: string
        +startedAt: DateTime
        +status: CycleStatus
        +stage: Stage
        +outcome: Outcome
        +estimatedValueCents: int
        +needsReview: bool
        +aiSummary: string
        +aiConfidence: float
    }
    class Message {
        +id: string
        +direction: Direction
        +textContent: string
        +sentAt: DateTime
    }
    class Attribution {
        +source: AttributionSource
        +method: AttributionMethod
        +confidence: float
        +campaignName: string
    }
    class Sale {
        +id: string
        +netAmountCents: int
        +status: SaleStatus
        +identificationSource: IdentificationSource
        +confidence: float
        +soldAt: DateTime
    }
    class SaleItem {
        +productName: string
        +quantity: int
        +unitPriceCents: int
    }
    class Integration {
        +id: string
        +type: ChannelType
        +connected: bool
    }

    Pharmacy "1" --> "*" User
    Pharmacy "1" --> "*" Contact
    Pharmacy "1" --> "*" Integration
    Contact "1" --> "*" ConversationCycle
    ConversationCycle "1" --> "*" Message
    ConversationCycle "1" --> "1" Attribution
    ConversationCycle "1" --> "0..1" Sale : gera
    Sale "1" --> "*" SaleItem
    Contact "1" --> "*" Sale
```

### 3. Diagrama de Sequência — mensagem vira venda

```mermaid
sequenceDiagram
    actor Cliente
    participant EVO as Evolution API
    participant API as Next.js (webhook)
    participant Q as Fila (pg-boss)
    participant W as Worker
    participant IA as Serviço de IA
    participant DB as PostgreSQL
    actor Gerente

    Cliente->>EVO: Mensagem WhatsApp
    EVO->>API: POST /webhooks/evolution
    API->>DB: Persistir mensagem bruta
    API->>Q: Enfileirar processamento
    Q->>W: Job: processar mensagem
    W->>DB: Localizar/criar ciclo de 24h
    W->>IA: Classificar (etapa, resultado, valor)
    IA-->>W: Classificação + confiança
    W->>DB: Atualizar ciclo + atribuição
    alt confiança < limiar
        W->>DB: Criar venda PENDING_REVIEW
        Gerente->>API: Abre fila de revisão
        Gerente->>API: Confirmar venda (C)
        API->>DB: Sale → CONFIRMED + auditoria
    else confiança alta
        W->>DB: Criar venda CONFIRMED
    end
    DB-->>Gerente: KPIs atualizados no dashboard
```

### 4. Diagrama de Atividades — revisão de vendas

```mermaid
flowchart TD
    A([Início: gerente abre fila]) --> B{Há vendas pendentes?}
    B -- Não --> Z([Estado vazio: tudo revisado])
    B -- Sim --> C[Exibir card: resumo IA + valor sugerido + confiança]
    C --> D{Decisão do gerente}
    D -- "Confirmar (C)" --> E[Venda → CONFIRMED]
    D -- "Ajustar (E)" --> F[Editar valor inline] --> E
    D -- "Não foi venda (X)" --> G[Selecionar motivo] --> H[Ciclo → NO_SALE]
    E --> I[Registrar auditoria]
    H --> I
    I --> J[Atualizar KPIs]
    J --> B
```

### 5. Diagrama de Componentes

```mermaid
flowchart TB
    subgraph Frontend["apps/web — Next.js App Router"]
        ROUTES["app/ (rotas)"]
        MODS["modules/ (domínio)"]
        COMP["components/ (ui · tables · charts)"]
        PROV["providers/ (Query · Command)"]
        ROUTES --> MODS --> COMP
        ROUTES --> PROV
    end

    subgraph Backend["Backend (planejado)"]
        APIR["API Routes / Server Actions"]
        AUTH["Auth.js (JWT + RBAC)"]
        QUEUE["pg-boss (filas)"]
        WORKER["Worker Node.js"]
        AICLS["Classificador IA"]
    end

    subgraph Dados["Dados"]
        PRISMA["Prisma ORM"]
        PG[("PostgreSQL")]
    end

    subgraph Externos["Serviços externos"]
        EVOX["Evolution API"]
        METAX["Meta Graph API"]
        GADS["Google Ads API"]
    end

    MODS -->|"api.ts (fetch)"| APIR
    APIR --> AUTH
    APIR --> PRISMA --> PG
    APIR --> QUEUE --> WORKER
    WORKER --> AICLS
    WORKER --> PRISMA
    EVOX -->|webhook| APIR
    WORKER --> METAX & GADS
```

### 6. Diagrama de Implantação

```mermaid
flowchart TB
    subgraph Client["Dispositivos do usuário"]
        BROWSER["Navegador desktop"]
        MOBILE["Navegador mobile"]
    end

    subgraph VPS["Hostinger VPS — Docker"]
        subgraph C1["container: web"]
            NEXT["Next.js (SSR + API)"]
        end
        subgraph C2["container: worker"]
            WK["Worker Node.js + pg-boss"]
        end
        subgraph C3["container: db"]
            PGD[("PostgreSQL 16")]
        end
        PROXY["Nginx / Caddy (TLS)"]
    end

    subgraph SaaS["Serviços externos"]
        EVOS["Evolution API"]
        LLM["API de IA (classificação)"]
        META["Meta / Google Ads"]
    end

    BROWSER & MOBILE -->|HTTPS| PROXY --> NEXT
    NEXT --> PGD
    WK --> PGD
    EVOS -->|webhook HTTPS| PROXY
    WK --> LLM & META
```

## Próximas fases

Backend conforme `docs/ARCHITECTURE.md`: Prisma + PostgreSQL, Auth.js, pg-boss, Evolution API (WhatsApp), classificação por IA e atribuição de campanhas.
