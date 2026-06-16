/* Superfície pública do domínio backend (Fase 1). */
export { hashPassword, verifyPassword } from "./auth/password.js";
export { can, type Action, type SessionRole } from "./auth/rbac.js";
export {
  generateInviteToken,
  hashToken,
  inviteExpiry,
  isInviteUsable,
} from "./auth/invitations.js";
export {
  resolvePharmacyContext,
  TenantAccessError,
  type PharmacyContext,
} from "./tenancy/context.js";
