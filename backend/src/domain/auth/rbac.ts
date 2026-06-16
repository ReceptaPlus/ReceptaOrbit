import type { PlatformRole, TenantRole } from "@prisma/client";

/* Autoridade de autorização SERVER-SIDE (espelha CONTRATOS-FRONTEND Parte 5).
   O can() do frontend decide renderização; ESTE decide o que de fato é permitido.
   Nenhuma mutação tenant-owned roda sem passar por aqui. */
export type Action =
  | "view_dashboard"
  | "view_full_phone"
  | "edit_classification"
  | "confirm_sale"
  | "reject_sale"
  | "refund_sale"
  | "manage_users"
  | "suspend_manager"
  | "manage_whatsapp"
  | "manage_ai"
  | "manage_tracking"
  | "edit_pharmacy"
  | "view_audit"
  | "access_admin"
  | "create_pharmacy"
  | "suspend_pharmacy";

export type SessionRole = TenantRole | PlatformRole;

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

export function can(role: SessionRole, action: Action): boolean {
  return PERMISSIONS[role].includes(action);
}
