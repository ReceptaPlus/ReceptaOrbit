/* Superfície pública do módulo tenancy (sessão simulada, autorização, switch). */
export {
  getCurrentUser,
  getMemberships,
  getCurrentSession,
  switchPharmacy,
  getTenantSwitcher,
  devSetRole,
} from "./api";
export { can } from "./authz";
export { getSession, setSession, subscribeSession, roleForContext } from "./session";
export { useSession, useCan } from "./hooks";
export type { CurrentSession, MembershipWithPharmacy, TenantSwitcherVM } from "./types";
export type { SessionState } from "@/mocks/session.mock";
