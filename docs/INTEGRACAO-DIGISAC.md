# Integração Digisac — Design Doc

**Status:** Fases 0–3 **implementadas** (ingestão WhatsApp-via-Digisac) · **Escopo:** adicionar a Digisac como _provider_ de canal (ingestão multicanal), de forma **aditiva** ao Evolution.

> Convenção: campos marcados com 🔎 dependem de confirmação na documentação oficial da Digisac (variam por versão da API/conta). O resto é baseado no código atual do Orbit.

## Implementação (arquivos)

| Peça | Arquivo |
|---|---|
| Schema (enum `ChannelProvider`, `provider`/`externalId` em `webhook_events`, modelo `ChannelConnection`) | [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma) |
| Migration | [`backend/prisma/migrations/20260624120000_channel_connections/`](../backend/prisma/migrations/20260624120000_channel_connections/migration.sql) |
| Rota webhook Digisac | [`frontend/src/app/api/webhooks/digisac/route.ts`](../frontend/src/app/api/webhooks/digisac/route.ts) |
| Normalizer | [`backend/src/domain/ingestion/digisac-payload.ts`](../backend/src/domain/ingestion/digisac-payload.ts) |
| Worker (dispatch por provider) | [`backend/src/worker/index.ts`](../backend/src/worker/index.ts) |
| Admin: actions | `connectDigisacAction`/`disconnectChannelAction` em [`frontend/src/server/admin.ts`](../frontend/src/server/admin.ts) |
| Admin: UI | [`frontend/src/app/admin/farmacias/channel-connect.tsx`](../frontend/src/app/admin/farmacias/channel-connect.tsx) |

**⚠️ Antes de usar em prod:** aplicar a migration no banco (`cd backend && npm run db:deploy`) **antes** de subir o código novo — senão a tabela/colunas não existem e a rota/worker quebram. Confirmar os campos 🔎 do payload (§15) contra a conta Digisac real.

---

## 1. Objetivo

Permitir onboarding de um cliente cuja central de atendimento é a **Digisac** (plataforma multicanal: WhatsApp oficial/não-oficial, Instagram, Telegram, Messenger, etc.), fazendo o Orbit **ingerir** as conversas dele para alimentar dashboard, IA de vendas e analytics — sem trocar a Evolution dos clientes existentes.

**Não-objetivo (nesta fase):** transformar o Orbit no chat/atendimento. Digisac já é a caixa de atendimento; o Orbit é a camada CRM/analytics por cima. Outbound (responder pelo Orbit) fica para uma fase futura (ver §10).

---

## 2. Princípio de arquitetura

O Orbit V1 já tem o ponto de extensão certo: a ingestão é **agnóstica de provider** em duas camadas.

- `webhook_events` é uma **fila durável genérica** — guarda o payload **bruto**, não é amarrada à Evolution.
- [`ingestMessage`](../backend/src/domain/ingestion/ingest.ts) + os modelos `Contact` / `Message` / `ConversationCycle` são neutros: trabalham com `phoneE164`, `direction`, `text`, `sentAt`. Não sabem o que é Evolution.

O único código Evolution-específico é:

1. **Parser de payload** — [`evolution-payload.ts`](../backend/src/domain/ingestion/evolution-payload.ts) (`extractMessages`, `normalizeEventName`).
2. **Ciclo de conexão** — `WhatsAppConnection` (QR / instância: criar, parear, logout).
3. **Resolução de tenant** — por `instanceName`.

A estratégia é **introduzir o conceito de `provider`** e plugar a Digisac nesses três pontos, reaproveitando todo o resto.

---

## 3. Visão geral do fluxo (ingestão)

```
Digisac (conta do cliente)
   │  webhook  POST /api/webhooks/digisac   (secret por header)
   ▼
[Next route] valida secret → grava BRUTO em webhook_events (provider=DIGISAC)
   │  (fila durável, responde 202 rápido — mesmo contrato da rota Evolution)
   ▼
[Worker] poll webhook_events PENDING
   │   switch(provider):
   │     EVOLUTION → evolution-payload.extractMessages()
   │     DIGISAC   → digisac-payload.extractMessages()   ← NOVO
   ▼
NormalizedMessage[]  → ingestMessage(pharmacyId, msg)   (INALTERADO)
   ▼
Contact / ConversationCycle / Message
```

Tudo abaixo de `ingestMessage` **não muda**. O trabalho é tudo **acima** dele.

---

## 4. O contrato normalizado (a "cola")

`ingestMessage` consome exatamente este shape (de [`evolution-payload.ts`](../backend/src/domain/ingestion/evolution-payload.ts)):

```ts
export interface NormalizedMessage {
  providerMessageId: string | null;
  remoteJid: string | undefined;   // ex.: "5511999998888@s.whatsapp.net"
  fromMe: boolean;
  pushName: string | null;         // nome do contato (fallback = telefone)
  text: string;
  sentAt: Date;
}
```

O normalizador da Digisac **só precisa produzir esse mesmo objeto.** Duas opções:

- **Rápida (fase 1):** sintetizar o `remoteJid` a partir do telefone Digisac → `` `${digits}@s.whatsapp.net` ``. `parseJid` já extrai `phoneE164` dele. Zero mudança em `ingestMessage`/`parseJid`. ✅ recomendado para WhatsApp-via-Digisac.
- **Limpa (fase 2, multicanal):** evoluir `NormalizedMessage` para carregar `channel` + `channelContactId` em vez de só `remoteJid`, e `ingestMessage` passa a chavear o Contact por canal (ver §9). Necessária quando entrar Instagram/Telegram (que não têm telefone).

---

## 5. Mudanças de schema (Prisma)

> Migrations no `backend/prisma/migrations`; o schema do frontend é **cópia** do backend (script `db:pull-schema`). Editar o do backend e copiar.

### 5.1 Enum de provider (novo)

```prisma
enum ChannelProvider {
  EVOLUTION
  DIGISAC
}
```

### 5.2 `webhook_events` — discriminador de provider

```prisma
model WebhookEvent {
  // ...campos atuais...
  provider   ChannelProvider @default(EVOLUTION) @map("provider")
  externalId String?         @map("external_id") // serviceId/accountId Digisac p/ resolver tenant
  // instanceName continua servindo p/ Evolution
}
```

`@default(EVOLUTION)` mantém os eventos atuais válidos sem backfill.

### 5.3 Conexão de canal — generalizar `WhatsAppConnection`

Hoje `WhatsAppConnection` é 1:1 com a farmácia e modela QR/instância. Digisac não tem QR — é conta + token + um ou mais "services" (canais). Duas abordagens:

- **(A) Modelo novo `ChannelConnection`** (recomendado) — coexiste com `WhatsAppConnection`, sem migrar o que já funciona:

```prisma
model ChannelConnection {
  id            String          @id @default(uuid()) @db.Uuid
  pharmacyId    String          @map("pharmacy_id") @db.Uuid
  provider      ChannelProvider
  // Digisac:
  externalId    String?         @map("external_id")   // serviceId/accountId que vem no webhook → resolve tenant
  apiBaseUrl    String?         @map("api_base_url")   // https://{conta}.digisac.me/api/v1  🔎
  // credencial NUNCA em claro — ref a secret externo (ver §11)
  tokenRef      String?         @map("token_ref")
  state         String          @default("DISCONNECTED")
  createdAt     DateTime        @default(now()) @map("created_at") @db.Timestamptz
  updatedAt     DateTime        @updatedAt @map("updated_at") @db.Timestamptz

  pharmacy Pharmacy @relation(fields: [pharmacyId], references: [id], onDelete: Cascade)

  @@unique([provider, externalId])  // resolve tenant: (DIGISAC, serviceId) → pharmacy
  @@index([pharmacyId])
  @@map("channel_connections")
}
```

- **(B) Estender `WhatsAppConnection`** com `provider`/`externalId`/`tokenRef`. Menos tabelas, mas polui um modelo cujo nome e PK (`pharmacyId` único) assumem 1 conexão WhatsApp por tenant. Digisac pode ter **vários services** por conta → o `@id pharmacyId` atrapalha. **Preferir (A).**

`Pharmacy` ganha back-relation `channelConnections ChannelConnection[]`.

---

## 6. Contrato do webhook Digisac (ingestão)

Nova rota: `frontend/src/app/api/webhooks/digisac/route.ts` — espelha a [rota Evolution](../frontend/src/app/api/webhooks/evolution/route.ts).

**Responsabilidades (idênticas à Evolution):** responder **rápido (202)**, gravar **bruto** em `webhook_events`, **não processar** nada na rota. O worker consome.

**Autenticação:** segredo por **header** (`x-webhook-secret` ou o header que a Digisac permitir configurar 🔎), comparação em **tempo constante** (reusar `secretMatches`/`timingSafeEqual` da rota Evolution). Não usar query-param.

**Payload esperado** (Digisac envia `{ event, data }` 🔎):

```jsonc
{
  "event": "message.created",          // 🔎 nomes reais: message.created / message.updated / ...
  "data": {
    "id": "uuid-da-mensagem",          // → providerMessageId
    "isFromMe": false,                 // → fromMe (direção)
    "text": "Olá, tem dipirona?",      // → text   (mídia: type != chat, ver §8)
    "type": "chat",                    // chat | ptt | image | document ... 🔎
    "timestamp": 1718900000,           // → sentAt (epoch ou ISO 🔎)
    "contactId": "uuid-contato",
    "serviceId": "uuid-do-canal",      // → resolve tenant (externalId) E o canal
    "ticketId": "uuid-atendimento",    // 🔎 útil p/ correlacionar ciclo (ver §12)
    "contact": {
      "name": "Maria",                 // → pushName
      "data": { "number": "5511999998888" }  // WhatsApp → telefone 🔎
    }
  }
}
```

A rota grava: `provider=DIGISAC`, `externalId = data.serviceId`, `eventType = event`, `payload = bruto`. Resolve tenant best-effort (igual à Evolution) consultando `ChannelConnection` por `(DIGISAC, serviceId)`; se não achar, grava com `pharmacyId=null` e o worker resolve.

---

## 7. Normalizador Digisac (worker)

Novo: `backend/src/domain/ingestion/digisac-payload.ts`. Espelha o contrato de `evolution-payload.ts`:

```ts
export function extractMessagesDigisac(payload: any): NormalizedMessage[] {
  const d = payload?.data;
  if (!d || typeof d.text !== "string") return [];        // mídia/sem texto: §8
  const number = String(d.contact?.data?.number ?? "").replace(/\D/g, "");
  if (!number) return [];                                  // sem telefone (canal não-WA): §9
  return [{
    providerMessageId: d.id ?? null,
    remoteJid: `${number}@s.whatsapp.net`,                 // sintetiza JID (fase 1)
    fromMe: Boolean(d.isFromMe),
    pushName: d.contact?.name ?? null,
    text: d.text,
    sentAt: toDate(d.timestamp),                           // normalizar epoch/ISO 🔎
  }];
}

export function isMessageEvent(event: string): boolean {
  return event === "message.created";                      // 🔎 ajustar aos eventos reais
}
```

Reaproveitar utilitários defensivos (`toDate`, etc.) do `evolution-payload.ts` ou extrair para um módulo comum.

---

## 8. Mídia e tipos não-texto

V1 só armazena `textContent`. Mensagens de mídia (áudio/imagem/documento):

- **Fase 1:** ignorar (retornar `[]`) ou gravar placeholder (`"[áudio]"`, `"[imagem]"`). Mesma postura que a Evolution hoje (`extractText` só pega texto).
- **Fase 2:** se a IA de vendas precisar do conteúdo, adicionar `MessageType` + `mediaUrl` ao `Message` e baixar o anexo via API Digisac. Fora de escopo aqui.

---

## 9. Multicanal real (Instagram / Telegram / etc.) — Fase 2

Bloqueio atual: `Contact` é único por **telefone** (`@@unique([pharmacyId, phoneE164])`). Instagram/Telegram **não têm telefone**.

Mudanças necessárias:

```prisma
model Contact {
  // ...
  channel          ChannelKind @default(WHATSAPP)        // novo enum
  channelContactId String      @map("channel_contact_id") // number | @handle | telegram id
  // troca a unicidade:
  // @@unique([pharmacyId, phoneE164])  →
  @@unique([pharmacyId, channel, channelContactId])
}

enum ChannelKind { WHATSAPP INSTAGRAM TELEGRAM MESSENGER SMS WEBCHAT }
```

E `NormalizedMessage` passa a carregar `channel` + `channelContactId` (em vez de só `remoteJid`), com `ingestMessage` chaveando por eles. Também impacta a UI (badge de canal na aba Conversas).

**Recomendação:** não fazer agora. Só quando existir cliente que use canal além de WhatsApp. WhatsApp-via-Digisac (§4 opção rápida) não precisa disso.

---

## 10. Outbound (responder pelo Orbit) — Futuro

Hoje **não existe envio** — nem na Evolution (o [client](../frontend/src/server/evolution/client.ts) tem `/message/send` mas nenhum call-site no app o usa; V1 é ingestão read-mostly).

Quando entrar, criar uma abstração única:

```ts
// server/channels/send.ts
async function sendMessage(pharmacyId: string, to: string, text: string): Promise<void>
// despacha por ChannelConnection.provider:
//   EVOLUTION → POST {base}/message/sendText/{instance}
//   DIGISAC   → POST {base}/messages  { serviceId, number|contactId, text, origin } 🔎
```

Greenfield para os dois providers — desenhar agnóstico desde o início.

---

## 11. Segurança

- **Token Digisac (por tenant):** é credencial de acesso total à central do cliente. **Nunca** gravar em claro no banco. Opções: variável de ambiente por tenant (Railway) referenciada por `tokenRef`, ou um secret store. O `ChannelConnection.tokenRef` guarda a **referência**, não o segredo. (Mesmo princípio do `AdAccount.accessToken` do banco de ads, que já é um problema conhecido — não repetir.)
- **Webhook secret:** por header, comparação em tempo constante (reusar `secretMatches`). Um segredo **por tenant** (não global) — assim o vazamento de um não compromete os outros. Validar contra o `ChannelConnection` resolvido por `serviceId`.
- **Validação de origem:** confirmar `serviceId` do payload corresponde a um `ChannelConnection` ativo antes de aceitar. Eventos de `serviceId` desconhecido → `FAILED`, não ingerir.
- **Rate limit:** aplicar o [rate-limiter](../frontend/src/lib/rate-limit.ts) na rota (defesa contra flood), chave por `serviceId`/IP.
- **PII:** logs sem telefone/nome/conteúdo (só ids), como já feito no resto.

---

## 12. Correlação de ciclo (nuance)

O Orbit modela conversa como **ciclo de 24h** (`ConversationCycle`, janela fixa, 1 OPEN por contato). A Digisac modela como **ticket/atendimento** (`ticketId`), que abre/fecha por regra própria (agente encerra, timeout, etc.).

- **Fase 1:** ignorar `ticketId`, manter a janela de 24h do Orbit. Simples, consistente com a Evolution.
- **Fase 2 (opcional):** se quiser o ciclo do Orbit espelhar o atendimento real da Digisac, mapear `ticketId` → ciclo (abrir no `ticket.opened`, fechar no `ticket.closed`). Maior fidelidade, mais acoplamento. Decidir com base no que a IA/dashboard precisam.

---

## 13. Onboarding por tenant

Provider é escolha **por farmácia**, não global. Fluxo no `/admin/farmacias`:

1. Admin cria a farmácia (já existe).
2. Admin escolhe o provider (Evolution = QR atual; Digisac = formulário novo).
3. Para Digisac: informar `apiBaseUrl` (subdomínio da conta), `externalId` (serviceId do canal) e o token (vai pro secret store, não pro banco).
4. Admin configura, **no painel da Digisac do cliente**, o webhook apontando para `https://<app>/api/webhooks/digisac` com o header-secret. 🔎 (passo manual do lado Digisac).
5. Teste: cliente manda msg → confirma evento em `webhook_events` → vira `Message`.

---

## 14. Plano de implementação

| Fase | Entrega | Esforço |
|---|---|---|
| **0** | Migration: `ChannelProvider`, `provider`/`externalId` em `webhook_events`, modelo `ChannelConnection` | ~0,5 dia |
| **1** | Rota `/api/webhooks/digisac` + `digisac-payload.ts` + dispatch por provider no worker + resolução de tenant por `serviceId` | ~1–1,5 dia |
| **2** | UI de onboarding Digisac no `/admin/farmacias` + secret store do token | ~1 dia |
| **3** | Smoke test com conta Digisac real (ingestão ponta-a-ponta) | ~0,5 dia |
| — | **WhatsApp-via-Digisac (só ingestão): ~3–3,5 dias** | |
| **4** (opcional) | Multicanal real (§9): `channel`+`channelContactId`, UI de canal | +1 semana |
| **5** (futuro) | Outbound abstraído (§10) | greenfield |

---

## 15. Questões abertas (confirmar antes de codar)

1. 🔎 **API Digisac:** base URL (subdomínio por conta?), formato de auth (Bearer? OAuth?), nomes de evento do webhook, shape exato do `data`, formato do timestamp.
2. 🔎 **Header-secret no webhook:** a Digisac permite header custom ou só URL? (impacta §6/§11).
3. 🔎 **`serviceId` é estável** por canal? (é a chave de resolução de tenant).
4. Mídia: ignorar ou placeholder na fase 1? (§8).
5. Ciclo: janela 24h do Orbit ou espelhar ticket Digisac? (§12).
6. O cliente Digisac usa **só WhatsApp** ou multicanal? (decide se entra a Fase 4).

---

## 16. Recomendação final

- **Não pré-construir.** Manter Evolution na V1.
- Implementar Fases 0–3 (**~3 dias**) quando houver um cliente Digisac real e confirmado — a arquitetura (fila durável + ingest agnóstico) já segura isso **sem reescrever nada existente**.
- Tratar provider como dimensão **por-tenant** desde o schema, para nunca precisar de um "big bang".
- Começar respondendo as 6 questões abertas do §15 com a documentação/conta Digisac do cliente.
