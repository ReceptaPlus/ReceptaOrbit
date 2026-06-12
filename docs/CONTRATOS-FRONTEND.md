# CONTRATOS-FRONTEND — Fonte Única da Verdade da UI

> **Documento congelado.** Nenhuma tela inventa estrutura própria. Componente que precisar de dado inexistente propõe alteração AQUI, com justificativa arquitetural, antes de implementar.
> Fontes: DOMAIN-MODEL.md (autoridade do domínio) · ESPECIFICACAO-FUNCIONAL/VISUAL · PLANO-EPOCA-1.
> Convenções globais: ids `string` prefixados (`usr_`, `pha_`, `cyc_`…) · datas ISO-8601 UTC (`string`) · dinheiro `Money` (centavos int) · confiança `number` 0–1 · enums UPPER_SNAKE, labels PT em `lib/constants.ts`.

---

# PARTE 1 — CONTRATOS DE DOMÍNIO

## Tipos base (Value Objects)

```ts
type Money = { amountCents: number; currency: "BRL" };          // ≥ 0, nunca float
type ActorRef =
  | { type: "USER"; userId: string; onBehalfOf?: string }       // onBehalfOf = pharmacyId (staff)
  | { type: "AI"; model: string }
  | { type: "SYSTEM" };

type AttributionSource = "META_ADS" | "GOOGLE_ADS" | "INSTAGRAM_ORGANIC" | "FACEBOOK_ORGANIC"
  | "WHATSAPP_ORGANIC" | "DIRECT" | "REFERRAL" | "UNKNOWN";
type AttributionMethod = "PROVIDER_REFERRAL" | "TRACKING_TOKEN" | "CLICK_IDENTIFIER"
  | "UTM" | "MANUAL" | "AI_INFERENCE";

interface Attribution {                  // VO-snapshot: imutável, copiado no momento
  source: AttributionSource;             // obrigatório
  method: AttributionMethod;             // obrigatório
  confidence: number;                    // obrigatório
  campaignName?: string;                 // opcional
  trackingLinkId?: string;               // opcional — ref por id, nunca objeto
}
```

## 1. User
**Responsabilidade:** identidade global da pessoa (credencial + nome). NÃO pertence a tenant.
```ts
interface User {
  id: string;                 // obrigatório · ro
  name: string;               // obrigatório · editável pelo próprio
  email: string;              // obrigatório · ro na UI (muda via suporte)
  createdAt: string;          // obrigatório · ro
  // initials: DERIVADO via initials(name) — nunca armazenado
}
```
**Regras:** criado por aceite de convite; alterado pelo próprio (nome) · visto pelo próprio e por gerentes do tenant (via Membership) · nunca excluído na UI (LGPD = anonimização, fora da Época 1).
**Relações:** 1→N Membership; 0..1 PlatformStaff.
```ts
{ id: "usr_antonio", name: "Antonio Ferreira", email: "antonio@dspaulo.com.br", createdAt: "2026-01-15T12:00:00Z" }
```

## 2. Membership
**Responsabilidade:** vínculo User×Pharmacy×papel — é ELE que é convidado/suspenso, não o User.
```ts
type TenantRole = "OWNER" | "MANAGER" | "VIEWER";
type MembershipStatus = "INVITED" | "ACTIVE" | "SUSPENDED";

interface Membership {
  id: string;                       // obrigatório · ro
  userId: string;                   // obrigatório · ro
  pharmacyId: string;               // obrigatório · ro
  role: TenantRole;                 // obrigatório · OWNER/MANAGER altera
  status: MembershipStatus;         // obrigatório · OWNER/MANAGER altera
  invitedByUserId?: string;         // opcional · ro
  inviteExpiresAt?: string;         // opcional (só INVITED) · ro
  lastAccessAt?: string;            // opcional · derivado de sessão · ro
  // userName / userEmail no ViewModel, não aqui (join)
}
```
**Regras:** OWNER/MANAGER cria (convite) e suspende · invariante: última OWNER/MANAGER ativa não pode ser suspensa/rebaixada · VIEWER só lê · exclusão = REVOKED (fora da Época 1; suspensão cobre).
**Relações:** N:1 User · N:1 Pharmacy · UNIQUE(userId, pharmacyId).
```ts
{ id: "mem_001", userId: "usr_antonio", pharmacyId: "pha_dsp", role: "MANAGER", status: "ACTIVE", lastAccessAt: "2026-06-12T17:30:00Z" }
{ id: "mem_004", userId: "usr_ana", pharmacyId: "pha_dsp", role: "VIEWER", status: "INVITED", invitedByUserId: "usr_camila", inviteExpiresAt: "2026-06-19T00:00:00Z" }
```

## 3. Pharmacy
**Responsabilidade:** o tenant — cadastro, plano, configurações de IA.
```ts
type PharmacyStatus = "ACTIVE" | "SUSPENDED";

interface Pharmacy {
  id: string;                       // obrigatório · ro
  tradeName: string;                // obrigatório · OWNER/MANAGER edita
  legalName: string;                // obrigatório
  cnpj: string;                     // obrigatório · formato 00.000.000/0000-00
  timezone: string;                 // obrigatório · default America/Sao_Paulo
  plan: "START" | "PRO";            // obrigatório · só PLATFORM_ADMIN altera
  status: PharmacyStatus;           // obrigatório · só PLATFORM_ADMIN altera
  aiSettings: {                     // OWNER/MANAGER altera (auditado)
    autoConfirmThreshold: number;   // 0.5–0.95 · default 0.85
    summaryLanguage: "pt-BR";
  };
}
```
**Regras:** criada por PLATFORM_ADMIN · suspensão só staff · todos os membros veem cadastro.
**Relações:** 1→1 WhatsAppConnection · 1→N Membership/Contact/TrackingLink.
```ts
{ id: "pha_dsp", tradeName: "Drogaria São Paulo — Jardim Europa", legalName: "DSP Farma Ltda.", cnpj: "12.345.678/0001-90", timezone: "America/Sao_Paulo", plan: "PRO", status: "ACTIVE", aiSettings: { autoConfirmThreshold: 0.85, summaryLanguage: "pt-BR" } }
```

## 4. WhatsAppConnection
**Responsabilidade:** estado do pareamento Evolution — máquina de 4 estados que alimenta o GlobalBanner.
```ts
type WhatsAppState = "DISCONNECTED" | "PAIRING" | "CONNECTED" | "DOWN";

interface WhatsAppConnection {
  pharmacyId: string;               // obrigatório · ro (1:1 com Pharmacy)
  state: WhatsAppState;             // obrigatório · transições só pela máquina
  pairedNumber?: string;            // opcional (CONNECTED/DOWN) · ro
  instanceName?: string;            // opcional · ro
  stateChangedAt: string;           // obrigatório · ro — "caído desde X" no banner
  qrExpiresAt?: string;             // opcional (PAIRING) · ro
}
```
**Regras:** OWNER/MANAGER inicia pareamento e desconecta (confirmação reforçada) · VIEWER só vê estado · transições válidas: DISCONNECTED→PAIRING→CONNECTED→{DOWN→PAIRING | DISCONNECTED}.
```ts
{ pharmacyId: "pha_dsp", state: "CONNECTED", pairedNumber: "+5511400289 22", instanceName: "drogaria-sp-01", stateChangedAt: "2026-06-10T08:00:00Z" }
```

## 5. Contact
**Responsabilidade:** pessoa-cliente consolidada por telefone DENTRO do tenant ("cliente" é estado derivado: purchaseCount > 0).
```ts
interface Contact {
  id: string;                       // obrigatório · ro
  pharmacyId: string;               // obrigatório · ro
  name: string;                     // obrigatório (fallback: telefone)
  phoneE164: string;                // obrigatório · UNIQUE por tenant · VIEWER vê mascarado (regra de exibição, não de dado)
  firstSeenAt: string;              // obrigatório · ro
  lastSeenAt: string;               // obrigatório · ro
  notes?: string;                   // opcional · MANAGER+ edita
  // DERIVADOS (projeções — UI nunca escreve):
  conversationCount: number;        // ro
  purchaseCount: number;            // ro
  totalSpent: Money;                // ro
  recurrentSources: AttributionSource[]; // ro
}
```
**Regras:** criado pelo sistema na 1ª mensagem · nome/notas editáveis por MANAGER+ · nunca deletado na UI.
**Relações:** 1→N ConversationCycle · 1→N Sale.
```ts
{ id: "cnt_rafael", pharmacyId: "pha_dsp", name: "Rafael Lima", phoneE164: "+5511990005543", firstSeenAt: "2025-11-20T10:00:00Z", lastSeenAt: "2026-06-12T10:07:00Z", conversationCount: 12, purchaseCount: 7, totalSpent: { amountCents: 52100, currency: "BRL" }, recurrentSources: ["META_ADS"], notes: "Prefere entrega." }
```

## 6. ConversationCycle
**Responsabilidade:** janela de 24h de conversa — unidade de classificação e atribuição.
```ts
type CycleStatus = "OPEN" | "WAITING_CUSTOMER" | "WAITING_PHARMACY" | "CLOSED" | "ARCHIVED";

interface ConversationCycle {
  id: string;                       // obrigatório · ro
  pharmacyId: string;               // obrigatório · ro
  contactId: string;                // obrigatório · ro
  startedAt: string;                // obrigatório · ro
  expiresAt: string;                // obrigatório · ro (startedAt+24h)
  lastMessageAt: string;            // obrigatório · ro
  status: CycleStatus;              // obrigatório · sistema/worker altera
  attribution: Attribution;         // obrigatório · VO-snapshot
  saleId?: string;                  // opcional · ref por id
  // DERIVADOS da AIAnalysis vigente (a UI lê DAQUI, nunca duplica):
  //   currentAnalysis: AIAnalysis  → via getCurrentAnalysis(cycleId)
  //   needsReview: boolean         → currentAnalysis.confidence < threshold && sem correção humana
}
```
**Regras:** criado pelo sistema (1ª msg fora de janela) · classificação NUNCA é campo do ciclo (anti-pattern 1) — vive em AIAnalysis · invariante: 1 OPEN por (pharmacy, contact).
**Relações:** N:1 Contact · 1→N Message · 1→N AIAnalysis · 0..1 Sale.
```ts
{ id: "cyc_006", pharmacyId: "pha_dsp", contactId: "cnt_carlos", startedAt: "2026-06-12T08:20:00Z", expiresAt: "2026-06-13T08:20:00Z", lastMessageAt: "2026-06-12T08:30:00Z", status: "CLOSED", attribution: { source: "GOOGLE_ADS", method: "UTM", confidence: 0.81, campaignName: "Marca Institucional" }, saleId: "sal_1038" }
```

## 7. Message
**Responsabilidade:** mensagem individual — espelho imutável do WhatsApp; fonte de verdade da auditoria.
```ts
interface Message {
  id: string;                       // obrigatório · ro
  cycleId: string;                  // obrigatório · ro
  pharmacyId: string;               // obrigatório · ro (herdado do ciclo)
  direction: "INBOUND" | "OUTBOUND";// obrigatório · ro
  textContent: string;              // obrigatório · ro · IMUTÁVEL
  sentAt: string;                   // obrigatório · ro
}
```
**Regras:** criada pelo sistema · NINGUÉM altera ou exclui · todos os papéis do tenant leem.
```ts
{ id: "msg_0601", cycleId: "cyc_006", pharmacyId: "pha_dsp", direction: "INBOUND", textContent: "Preciso de antibiótico com receita, posso levar pessoalmente?", sentAt: "2026-06-12T08:20:00Z" }
```

## 8. AIAnalysis
**Responsabilidade:** UMA execução de classificação, versionada — preserva histórico IA vs humano.
```ts
type Stage = "NEW" | "IN_SERVICE" | "NEEDS_IDENTIFIED" | "QUOTE_SENT" | "NEGOTIATION"
  | "SALE_CONFIRMED" | "LOST" | "UNCLASSIFIED";
type Outcome = "SALE" | "NO_SALE" | "ABANDONED" | "SPAM" | "SUPPORT" | "UNKNOWN";

interface AIAnalysis {
  id: string;                       // obrigatório · ro
  cycleId: string;                  // obrigatório · ro
  version: number;                  // obrigatório · ro · sequencial por ciclo
  actor: ActorRef;                  // obrigatório · ro — AI ou USER (correção)
  stage: Stage;                     // obrigatório · ro (correção = NOVA versão)
  outcome: Outcome;                 // obrigatório · ro
  estimatedValue: Money | null;     // obrigatório (nullable) · ro
  confidence: number;               // obrigatório · ro · 1.0 quando actor USER
  summary: string;                  // obrigatório · ro
  correctionReason?: string;        // opcional · obrigatório SE actor USER
  createdAt: string;                // obrigatório · ro
  supersededBy据Id?: string;          // opcional · ro
}
```
**Regras:** append-only · IA cria · correção humana (MANAGER+) cria versão nova com motivo obrigatório · versão humana só é superada por outra humana · "vigente" = maior version não-superada.
```ts
// ciclo cyc_006 — duas versões (IA + correção humana):
{ id: "ana_006a", cycleId: "cyc_006", version: 1, actor: { type: "AI", model: "claude-haiku" }, stage: "SALE_CONFIRMED", outcome: "SALE", estimatedValue: { amountCents: 21000, currency: "BRL" }, confidence: 0.55, summary: "Venda presencial estimada de antibiótico com receita.", createdAt: "2026-06-12T08:31:00Z", supersededById: "ana_006b" }
{ id: "ana_006b", cycleId: "cyc_006", version: 2, actor: { type: "USER", userId: "usr_antonio" }, stage: "SALE_CONFIRMED", outcome: "SALE", estimatedValue: { amountCents: 18900, currency: "BRL" }, confidence: 1.0, summary: "Venda presencial confirmada no balcão.", correctionReason: "Valor real do cupom fiscal.", createdAt: "2026-06-12T11:00:00Z" }
```

## 9. Sale
**Responsabilidade:** fato comercial com status — nunca booleano no ciclo.
```ts
type SaleStatus = "PENDING_REVIEW" | "CONFIRMED" | "CANCELLED" | "REFUNDED";
type IdentificationSource = "AI" | "MANUAL" | "INTEGRATION";

interface Sale {
  id: string;                       // obrigatório · ro
  pharmacyId: string;               // obrigatório · ro
  contactId: string;                // obrigatório · ro
  conversationCycleId: string | null; // obrigatório (NULLABLE — venda manual; NUNCA id sentinela)
  amount: Money;                    // obrigatório · MANAGER+ corrige (auditado)
  status: SaleStatus;               // obrigatório · transições: PENDING→CONFIRMED|CANCELLED · CONFIRMED→REFUNDED
  identificationSource: IdentificationSource; // obrigatório · ro
  confidence: number;               // obrigatório · ro · 1.0 se MANUAL
  attribution: Attribution;         // obrigatório · VO copiado do ciclo no momento
  soldAt: string;                   // obrigatório
  items: SaleItem[];                // obrigatório (≥1)
}
```
**Regras:** criada por worker (IA) ou MANAGER+ (manual) · confirmar/rejeitar/estornar: MANAGER+ · VIEWER só lê · invariante: mesmo pharmacyId/contactId do ciclo de origem.
```ts
{ id: "sal_1038", pharmacyId: "pha_dsp", contactId: "cnt_carlos", conversationCycleId: "cyc_006", amount: { amountCents: 18900, currency: "BRL" }, status: "PENDING_REVIEW", identificationSource: "AI", confidence: 0.55, attribution: { source: "GOOGLE_ADS", method: "UTM", confidence: 0.81, campaignName: "Marca Institucional" }, soldAt: "2026-06-12T08:30:00Z", items: [{ rawName: "antibiotico receita", normalizedName: "Manipulado (antibiótico)", quantity: 1, unitPrice: { amountCents: 18900, currency: "BRL" }, totalPrice: { amountCents: 18900, currency: "BRL" } }] }
```

## 10. SaleItem
**Responsabilidade:** linha de produto — preserva o nome bruto dito na conversa E o normalizado.
```ts
interface SaleItem {
  rawName: string;                  // obrigatório · ro — como apareceu na conversa
  normalizedName: string;           // obrigatório — produto canônico
  quantity: number;                 // obrigatório · int ≥ 1
  unitPrice: Money;                 // obrigatório
  totalPrice: Money;                // obrigatório · derivado (qty×unit) mas materializado
}
```
**Regras:** vive dentro da Sale (sem id próprio na UI) · editável só via correção da venda.

## 11. TrackingLink
**Responsabilidade:** link rastreável token→campanha→canal que origina atribuições determinísticas.
```ts
interface TrackingLink {
  id: string;                       // obrigatório · ro
  pharmacyId: string;               // obrigatório · ro
  token: string;                    // obrigatório · ro · único global, não-sequencial
  campaignName: string;             // obrigatório
  channel: AttributionSource;       // obrigatório
  url: string;                      // DERIVADO: wa.me/<numero>?text=<token> · ro
  active: boolean;                  // obrigatório · desativar ≠ deletar
  createdAt: string;                // obrigatório · ro
  // DERIVADOS: clickCount, attributedCycleCount (projeções · ro)
  clickCount: number;
  attributedCycleCount: number;
}
```
**Regras:** MANAGER+ cria/desativa · NUNCA deletado (atribuições históricas referenciam).
```ts
{ id: "trk_001", pharmacyId: "pha_dsp", token: "gj7x2k", campaignName: "Genéricos Junho", channel: "META_ADS", url: "https://wa.me/5511400289?text=gj7x2k", active: true, createdAt: "2026-06-01T00:00:00Z", clickCount: 214, attributedCycleCount: 38 }
```

## 12. Attribution
Ver Tipos base — é VO-snapshot, não entidade. Nunca tabela compartilhada; cada Cycle/Sale carrega sua cópia do momento. Re-atribuição = novo VO + AuditLog.

## 13. AuditLog
**Responsabilidade:** trilha imutável de toda mutação com ator — base da confiança no número.
```ts
type AuditAction = "SALE_CONFIRMED" | "SALE_REJECTED" | "SALE_REFUNDED" | "SALE_VALUE_CORRECTED"
  | "CLASSIFICATION_CORRECTED" | "USER_INVITED" | "INVITE_CANCELLED" | "INVITE_RESENT"
  | "MEMBERSHIP_SUSPENDED" | "MEMBERSHIP_REACTIVATED" | "WHATSAPP_CONNECTED"
  | "WHATSAPP_DISCONNECTED" | "AI_THRESHOLD_CHANGED" | "PHARMACY_UPDATED";

interface AuditLog {
  id: string;                       // obrigatório · ro
  pharmacyId: string;               // obrigatório · ro
  actor: ActorRef;                  // obrigatório · ro · staff sempre com onBehalfOf
  action: AuditAction;              // obrigatório · ro
  entityRef: { type: string; id: string }; // obrigatório · ro
  before: Record<string, unknown> | null;  // obrigatório (nullable) · ro
  after: Record<string, unknown> | null;   // obrigatório (nullable) · ro
  at: string;                       // obrigatório · ro
}
```
**Regras:** APPEND-ONLY — nenhum papel altera/exclui · MANAGER+ lê no tenant · PLATFORM_SUPPORT lê cross-tenant.
```ts
{ id: "aud_101", pharmacyId: "pha_dsp", actor: { type: "USER", userId: "usr_antonio" }, action: "CLASSIFICATION_CORRECTED", entityRef: { type: "AIAnalysis", id: "ana_006b" }, before: { estimatedValue: 21000 }, after: { estimatedValue: 18900 }, at: "2026-06-12T11:00:00Z" }
```

---

# PARTE 2 — CONTRATOS DE VIEWMODEL

Regra: UI consome **ViewModel**, nunca entidade crua. Transformação vive em `modules/*/api.ts` (selectors). Formatação (BRL, datas, máscara) acontece NA transformação — componente recebe string pronta onde indicado.

```ts
interface DashboardVM {
  kpis: { totalSold: string; avgTicket: string; conversionRate: string;
          pendingReviewCount: number };                        // formatados; count cru p/ badge
  weekBars: { label: string; value: number }[];
  topProducts: { name: string; qty: number; pct: number }[];
  salesBySource: { source: AttributionSource; total: string; count: number }[];
  recentCycles: CycleRowVM[];                                  // 5
  whatsAppState: WhatsAppState;                                // decide empty-onboarding e banner
}

interface CycleRowVM {            // linha de Conversas + recentes do dashboard
  id: string; contactName: string; phoneDisplay: string;       // já mascarado por papel!
  source: AttributionSource; stage: Stage; status: CycleStatus; outcome: Outcome;
  valueDisplay: string | null;                                 // "R$ 89,00"
  lastMessageTime: string;                                     // "14:51"
  confidence: number; needsReview: boolean;                    // derivado: análise vigente × threshold
}

interface CycleDetailVM {
  id: string; contactId: string; contactName: string; phoneDisplay: string;
  messages: { id: string; direction: "INBOUND" | "OUTBOUND"; text: string; time: string }[];
  current: { stage: Stage; outcome: Outcome; valueDisplay: string | null;
             confidence: number; summary: string; isHumanCorrected: boolean };
  attribution: Attribution & { methodLabel: string };
  sale?: { id: string; amountDisplay: string; itemsSummary: string };
  auditEntries: AuditEntryVM[];
  canCorrect: boolean;                                         // permissão pré-resolvida
}

interface ContactRowVM {
  id: string; name: string; phoneDisplay: string; firstSeen: string; lastSeen: string;
  conversationCount: number; purchaseCount: number;
  totalDisplay: string; avgTicketDisplay: string | null;       // null se 0 compras
  sources: AttributionSource[];
}

interface SaleRowVM {
  id: string; contactName: string; dateDisplay: string;
  source: AttributionSource; campaignName?: string;
  itemsSummary: string;                                        // "4× Omeprazol, 4× Loratadina"
  amountDisplay: string; status: SaleStatus;
  identificationLabel: string; confidence: number;
  cycleId: string | null;                                      // null = sem "ver conversa"
  canConfirm: boolean;
}

interface MyAccountVM {
  name: string; email: string; initials: string;
  memberships: { pharmacyName: string; roleLabel: string }[];
}

interface AdminPharmacyRowVM {
  id: string; tradeName: string; plan: string; status: PharmacyStatus;
  whatsAppState: WhatsAppState; whatsAppStateSince: string;    // "caído há 3h"
  pendingReviewCount: number; lastEventDisplay: string;
}

interface TenantSwitcherVM {
  current: { id: string; name: string };
  options: { id: string; name: string; pendingCount: number; whatsAppDown: boolean }[];
  visible: boolean;                                            // false se 1 membership
}
```

Derivações canônicas: `needsReview = vigente.actor.type==="AI" && vigente.confidence < pharmacy.aiSettings.autoConfirmThreshold` · `phoneDisplay = role==="VIEWER" ? mask(phone) : format(phone)` · badges da sidebar = `cycles.filter(needsReview).length` e `sales.filter(s=>s.status==="PENDING_REVIEW").length`.

---

# PARTE 3 — CONTRATOS DE API (assinaturas futuras)

Envelope: `Promise<T>` que rejeita com `ApiError { code, message }`. Paginação: `Page<T> = { items: T[]; total: number; page: number; pageSize: number }`. Época 1 = mesmas assinaturas lendo mocks (sync embrulhado em Promise).

```ts
// sessão / tenancy
getCurrentUser(): Promise<User>
getMemberships(): Promise<(Membership & { pharmacyName: string })[]>
getCurrentSession(): Promise<{ user: User; membership: Membership; pharmacy: Pharmacy }>
switchPharmacy(pharmacyId: string): Promise<void>

// dashboard
getDashboard(period: "7d" | "14d" | "30d"): Promise<DashboardVM>

// conversas
getConversations(q: { page?: number; source?: AttributionSource[]; stage?: Stage[];
  status?: CycleStatus[]; needsReview?: boolean; sort?: "lastMessageAt" | "value" }): Promise<Page<CycleRowVM>>
getConversation(id: string): Promise<CycleDetailVM>
correctClassification(cycleId: string, input: CorrectionInput): Promise<void>   // cria AIAnalysis v+1 + audit

// vendas
getSales(q: { page?: number; status?: SaleStatus[]; source?: AttributionSource[];
  sort?: "soldAt" | "amount" }): Promise<Page<SaleRowVM>>
getSale(id: string): Promise<Sale & { audit: AuditLog[] }>
getPendingSales(): Promise<SaleRowVM[]>
confirmSale(id: string, amount?: Money): Promise<void>
rejectSale(id: string, reason: RejectReason, note?: string): Promise<void>

// clientes
getCustomers(q: { page?: number; search?: string;
  sort?: "totalSpent" | "lastSeenAt" | "name" }): Promise<Page<ContactRowVM>>
getCustomer(id: string): Promise<Contact & { cycles: CycleRowVM[]; sales: SaleRowVM[] }>

// configurações
getTeam(): Promise<MembershipRowVM[]>
inviteUser(input: InviteUserInput): Promise<void>
resendInvite(membershipId: string): Promise<void>
cancelInvite(membershipId: string): Promise<void>
suspendMembership(id: string): Promise<void>
reactivateMembership(id: string): Promise<void>
getWhatsApp(): Promise<WhatsAppConnection>
startPairing(): Promise<{ qrExpiresAt: string }>
disconnectWhatsApp(): Promise<void>
getTrackingLinks(): Promise<TrackingLink[]>
createTrackingLink(input: { campaignName: string; channel: AttributionSource }): Promise<TrackingLink>
disableTrackingLink(id: string): Promise<void>
updateAISettings(input: { autoConfirmThreshold: number }): Promise<void>
getAuditLog(q: { page?: number; action?: AuditAction[]; actorUserId?: string }): Promise<Page<AuditLog>>
updatePharmacy(input: PharmacyInput): Promise<void>

// conta
updateProfile(input: { name: string }): Promise<void>
changePassword(input: { current: string; next: string }): Promise<void>

// admin (staff)
adminListPharmacies(q: { search?: string }): Promise<AdminPharmacyRowVM[]>
adminCreatePharmacy(input: { tradeName: string; cnpj: string }): Promise<Pharmacy>
adminSuspendPharmacy(id: string): Promise<void>
```

---

# PARTE 4 — CONTRATOS DE MOCKS

`src/mocks/` — única fonte de dado falso. Cada arquivo exporta arrays tipados PELOS CONTRATOS DA PARTE 1.

| Arquivo | Finalidade | Mín. | Cenários OBRIGATÓRIOS |
|---|---|---|---|
| `users.mock.ts` | identidades | 5 | gerente (sessão default) · viewer · 2º gerente · convidada (sem 1º acesso) · staff |
| `platform-staff.mock.ts` | papéis de plataforma | 1 | PLATFORM_ADMIN (NUNCA em memberships de tenant) |
| `pharmacies.mock.ts` | tenants | 3 | WhatsApp CONNECTED · DOWN (dispara banner) · PAIRING; planos distintos; thresholds distintos (0.85 e 0.70 — testa needsReview relativo) |
| `memberships.mock.ts` | vínculos | 6 | usuário com 2 farmácias (switcher!) · 1 INVITED com expiração · 1 SUSPENDED · roles OWNER/MANAGER/VIEWER presentes |
| `whatsapp.mock.ts` | conexões | 3 | um por estado relevante (espelha pharmacies) |
| `contacts.mock.ts` | clientes | 9 | recorrente (7 compras) · novo sem compra · só-orçamento · de outra farmácia (isolamento de tenant) |
| `conversations.mock.ts` + `messages` | ciclos | 8 | OPEN · WAITING_PHARMACY · CLOSED com venda · CLOSED sem venda (LOST) · needsReview=true · ciclo do tenant B (nunca aparece no A) |
| `analyses.mock.ts` | versões IA | 10 | ciclo com 1 versão IA alta confiança · ciclo com IA baixa (needsReview) · **ciclo com v1 IA + v2 correção humana** (supersededBy preenchido) |
| `sales.mock.ts` | vendas | 6 | PENDING_REVIEW (fila!) · CONFIRMED por IA · CONFIRMED por correção · REFUNDED · **MANUAL com conversationCycleId: null** |
| `tracking-links.mock.ts` | links | 3 | ativo com cliques · ativo zerado (empty de métricas) · desativado |
| `audit.mock.ts` | trilha | 8 | correção de classificação (before/after) · confirmação de venda · convite · threshold alterado · **ação de staff com onBehalfOf** |
| `session.mock.ts` | sessão simulada | 1 | `{ currentUserId, currentPharmacyId, role }` mutável pelo DevSwitcher |

Critério: **todo estado visual da UI tem dado que o produz** — banner (DOWN), fila (pendentes), switcher (2 memberships), convite pendente, auditoria com humano vs IA, isolamento de tenant verificável trocando de farmácia.

---

# PARTE 5 — CONTRATOS DE PERMISSÃO

Papéis: plataforma `PLATFORM_ADMIN | PLATFORM_SUPPORT` (em PlatformStaff) · tenant `OWNER | MANAGER | VIEWER` (em Membership). OWNER ⊇ MANAGER (tudo de manager + suspender manager + transferir propriedade futura).

| Ação | OWNER | MANAGER | VIEWER | P_ADMIN | P_SUPPORT |
|---|---|---|---|---|---|
| view_dashboard / view_conversations / view_customers / view_sales | ✅ | ✅ | ✅ | ✅* | ✅* |
| view_full_phone | ✅ | ✅ | ❌ (mascarado) | ✅* | ❌ |
| edit_classification | ✅ | ✅ | ❌ | ✅* | ❌ |
| confirm_sale / reject_sale / refund_sale | ✅ | ✅ | ❌ | ✅* | ❌ |
| manage_users (convidar/suspender VIEWER+MANAGER) | ✅ | ✅ | ❌ | ✅* | ❌ |
| suspend_manager | ✅ | ❌ | ❌ | ✅* | ❌ |
| manage_whatsapp / manage_tracking / manage_ai / edit_pharmacy | ✅ | ✅ | ❌ | ✅* | ❌ |
| view_audit | ✅ | ✅ | ❌ | ✅* | ✅* |
| access_admin (área /admin) | ❌ | ❌ | ❌ | ✅ | ✅ ro |
| create_pharmacy / suspend_pharmacy | ❌ | ❌ | ❌ | ✅ | ❌ |

`*` = dentro de tenant, sempre com `onBehalfOf` gravado na auditoria.

**Contrato único de autorização:**
```ts
type Action = "view_dashboard" | "view_full_phone" | "edit_classification" | "confirm_sale"
  | "reject_sale" | "refund_sale" | "manage_users" | "suspend_manager" | "manage_whatsapp"
  | "manage_ai" | "manage_tracking" | "edit_pharmacy" | "view_audit" | "access_admin"
  | "create_pharmacy" | "suspend_pharmacy";

can(action: Action): boolean        // lê a sessão (mock na Época 1, Auth.js depois)
```
Regra de UI: `can()` decide **renderização** (botão some para VIEWER, não desabilita) e **rota** (redirect). É a ÚNICA porta — proibido `if (role === "MANAGER")` espalhado.

---

# PARTE 6 — CONTRATOS DE ESTADO

Padrão único — todo fetch de módulo resolve para:
```ts
type UIState<T> =
  | { kind: "loading" }                                  // Skeleton espelhando layout
  | { kind: "empty"; variant: "onboarding" | "filter" | "success" }  // EmptyState
  | { kind: "error"; retry: () => void }                 // ErrorState com ação
  | { kind: "ready"; data: T };                          // conteúdo
```

| Módulo | loading | empty (variante) | error | success/ready |
|---|---|---|---|---|
| Dashboard | skeleton grade KPI+charts | onboarding (WhatsApp ≠ CONNECTED) | seção c/ retry; KPI isolado mostra "—" | dados + drill-down |
| Conversas | skeleton 6 linhas ✓ | onboarding (0 ciclos) · filter (busca/filtros) | retry | tabela/cards |
| Clientes | idem | onboarding · filter | retry | idem |
| Vendas | idem | "vendas aparecem aqui" · **success na fila ("Tudo revisado ✓")** | retry; falha de confirmação → toast erro + item volta | idem |
| Configurações | skeleton por tab | usuários: "convide sua equipe" · rastreamento: "crie seu 1º link" | Zod inline + toast em falha de save | forms/tabelas |
| Administração | skeleton tabela | "crie a primeira farmácia" | retry | tabela |

Mutações (transversal): gatilho com pending → sucesso = toast (+desfazer 5s quando aplicável) → falha = toast erro SEM perder input do usuário.

---

# PARTE 7 — CONGELAMENTO

**1. Contratos congelados:** Money · ActorRef · Attribution · User · Membership · Pharmacy · WhatsAppConnection · Contact · ConversationCycle · Message · AIAnalysis · Sale · SaleItem · TrackingLink · AuditLog · todos os VMs da Parte 2 · assinaturas da Parte 3 · `can()/Action` · `UIState<T>`.

**2. Campos proibidos** (existiram em rascunhos; NÃO voltar):
- `cycle.aiSummary / aiConfidence / stage` como campos do ciclo (vive em AIAnalysis)
- `user.pharmacyId` (vive em Membership)
- `sale.valor: number` em reais float (Money em centavos)
- `conversationCycleId: "c-000"` sentinela (é `null`)
- `contact.totalSpentCents` escrito pela UI (projeção ro)
- `role: "RECEPTA_ADMIN"` dentro de TenantRole (vive em PlatformStaff)

**3. Nomes proibidos / canônicos:**
- ~~Customer~~ → **Contact** (domínio); UI exibe "Clientes"
- ~~Ajustar~~ → **Corrigir** (toda correção de classificação/valor)
- ~~Atendente~~ → não existe; papéis tenant são OWNER/MANAGER/VIEWER
- ~~WhatsAppInstance~~ → **WhatsAppConnection** (este doc unifica)

**4. Estruturas redundantes eliminadas:** labels PT duplicados (só `lib/constants.ts`) · formatação de moeda em componente (só nos selectors de VM) · `initials` armazenado (sempre derivado) · `needsReview` armazenado (sempre derivado de análise vigente × threshold do tenant).

**5. Inconsistências detectadas e resolvidas neste congelamento:**
- mocks atuais (`lib/mock-data.ts`) violam contratos (classificação inline, ids `c-000`, staff no tenant) → **substituição por `src/mocks/*` é o primeiro passo do Incremento 1**, não débito.
- `OWNER` não existia nos docs anteriores (só MANAGER/VIEWER) → incorporado: OWNER = MANAGER + suspender managers; mocks devem ter 1 OWNER.
- threshold fixo 85% em textos anteriores → é `pharmacy.aiSettings.autoConfirmThreshold` (varia por tenant; mocks com 2 valores).

---

> **"Os contratos estão congelados e a implementação da Época 1 pode iniciar sem risco de divergência estrutural."**

Critérios de aceite do Incremento 1 (verificáveis no preview): trocar tenant (A→B→C) e TODA a UI reagir · trocar papel (Owner/Manager/Viewer/Staff) e menus/ações mudarem via `can()` · simular WhatsApp pelos 4 estados e o GlobalBanner aparecer/sumir · navegar Dashboard/Conversas/Clientes/Vendas/Configurações/Perfil/Admin sem erro, 100% mock.
