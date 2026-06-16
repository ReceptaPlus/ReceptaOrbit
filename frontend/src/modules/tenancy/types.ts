import type { Membership, Pharmacy, User } from "@/types/domain";

export type MembershipWithPharmacy = Membership & { pharmacyName: string };

export interface CurrentSession {
  user: User;
  membership: Membership | null; // null quando staff sem membership no tenant
  pharmacy: Pharmacy | null;
}

/** ViewModel do seletor de farmácia (sidebar). visible=false se < 2 memberships. */
export interface TenantSwitcherVM {
  current: { id: string; name: string } | null;
  options: { id: string; name: string; pendingCount: number; whatsAppDown: boolean }[];
  visible: boolean;
}
