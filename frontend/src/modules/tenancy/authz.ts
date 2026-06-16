/* Autorização (CONTRATOS-FRONTEND Parte 5). can() é a ÚNICA porta — proibido
   `if (role === "MANAGER")` espalhado. Decide RENDERIZAÇÃO (botão some p/ VIEWER,
   não desabilita) e ROTA (redirect). OWNER ⊇ MANAGER ⊇ VIEWER. */
import { getSession } from "./session";
import type { Action, SessionRole } from "@/types/domain";

const VIEWER: Action[] = ["view_dashboard"];

const MANAGER: Action[] = [
  ...VIEWER,
  "view_full_phone",
  "edit_classification",
  "confirm_sale",
  "reject_sale",
  "refund_sale",
  "manage_users",
  "manage_whatsapp",
  "manage_ai",
  "manage_tracking",
  "edit_pharmacy",
  "view_audit",
];

const OWNER: Action[] = [...MANAGER, "suspend_manager"];

const PLATFORM_ADMIN: Action[] = [...OWNER, "access_admin", "create_pharmacy", "suspend_pharmacy"];

const PLATFORM_SUPPORT: Action[] = ["view_dashboard", "view_audit", "access_admin"];

const PERMISSIONS: Record<SessionRole, readonly Action[]> = {
  VIEWER,
  MANAGER,
  OWNER,
  PLATFORM_ADMIN,
  PLATFORM_SUPPORT,
};

/** Pode executar a ação no papel atual da sessão (ou num papel explícito). */
export function can(action: Action, role: SessionRole = getSession().role): boolean {
  return PERMISSIONS[role].includes(action);
}
