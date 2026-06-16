/* ==========================================================================
   src/mocks — ÚNICA fonte de dado falso (Época 1).
   Cada arquivo exporta arrays tipados pelos CONTRATOS de domínio (src/types/domain).
   Consumido apenas por modules/<x>/api.ts (selectors → ViewModels). Componentes
   NUNCA importam daqui. Substitui o antigo src/lib/mock-data.ts.
   ========================================================================== */

export { users } from "./users.mock";
export { platformStaff } from "./platform-staff.mock";
export { pharmacies } from "./pharmacies.mock";
export { memberships } from "./memberships.mock";
export { whatsappConnections } from "./whatsapp.mock";
export { contacts } from "./contacts.mock";
export { conversationCycles, messages } from "./conversations.mock";
export { analyses } from "./analyses.mock";
export { sales } from "./sales.mock";
export { trackingLinks } from "./tracking-links.mock";
export { auditLogs } from "./audit.mock";
export { initialSession, type SessionState } from "./session.mock";
