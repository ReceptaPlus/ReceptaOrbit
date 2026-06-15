import type { UserRole } from "@/modules/settings/types";

export type Action =
  | "view_dashboard"
  | "view_conversations"
  | "edit_classification"
  | "confirm_sale"
  | "reject_sale"
  | "view_full_phone"
  | "manage_team"
  | "invite_member"
  | "suspend_member"
  | "manage_integrations"
  | "edit_pharmacy"
  | "manage_tracking"
  | "edit_ai_settings"
  | "view_audit"
  | "switch_tenant"
  | "view_profile"
  | "edit_own_profile"
  | "change_own_password"
  | "view_own_memberships"
  | "view_platform_role";

const MATRIX: Record<Action, UserRole[]> = {
  view_dashboard:        ["RECEPTA_ADMIN", "PHARMACY_MANAGER", "PHARMACY_VIEWER"],
  view_conversations:    ["RECEPTA_ADMIN", "PHARMACY_MANAGER", "PHARMACY_VIEWER"],
  edit_classification:   ["RECEPTA_ADMIN", "PHARMACY_MANAGER"],
  confirm_sale:          ["RECEPTA_ADMIN", "PHARMACY_MANAGER"],
  reject_sale:           ["RECEPTA_ADMIN", "PHARMACY_MANAGER"],
  view_full_phone:       ["RECEPTA_ADMIN", "PHARMACY_MANAGER"],
  manage_team:           ["RECEPTA_ADMIN", "PHARMACY_MANAGER"],
  invite_member:         ["RECEPTA_ADMIN", "PHARMACY_MANAGER"],
  suspend_member:        ["RECEPTA_ADMIN"],
  manage_integrations:   ["RECEPTA_ADMIN", "PHARMACY_MANAGER"],
  edit_pharmacy:         ["RECEPTA_ADMIN", "PHARMACY_MANAGER"],
  manage_tracking:       ["RECEPTA_ADMIN", "PHARMACY_MANAGER"],
  edit_ai_settings:      ["RECEPTA_ADMIN", "PHARMACY_MANAGER"],
  view_audit:            ["RECEPTA_ADMIN", "PHARMACY_MANAGER"],
  switch_tenant:         ["RECEPTA_ADMIN", "PHARMACY_MANAGER", "PHARMACY_VIEWER"],
  view_profile:          ["RECEPTA_ADMIN", "PHARMACY_MANAGER", "PHARMACY_VIEWER"],
  edit_own_profile:      ["RECEPTA_ADMIN", "PHARMACY_MANAGER", "PHARMACY_VIEWER"],
  change_own_password:   ["RECEPTA_ADMIN", "PHARMACY_MANAGER", "PHARMACY_VIEWER"],
  view_own_memberships:  ["RECEPTA_ADMIN", "PHARMACY_MANAGER", "PHARMACY_VIEWER"],
  view_platform_role:    ["RECEPTA_ADMIN"],
};

export function can(action: Action, role: UserRole): boolean {
  return MATRIX[action]?.includes(role) ?? false;
}
