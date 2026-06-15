import type { UserRole } from "@/modules/settings/types";

export interface UserProfileVM {
  id: string;
  initials: string;
  name: string;
  email: string;
  username: string;
  lastLoginAt: string;
  createdAt: string;
  status: "ACTIVE" | "SUSPENDED";
  isStaff: boolean;
  memberships: MembershipItemVM[];
}

export interface MembershipItemVM {
  pharmacyId: string;
  pharmacyName: string;
  role: UserRole;
  isCurrent: boolean;
}

export interface SecurityVM {
  lastLoginAt: string;
  lastLoginDevice: string;
  lastLoginIp: string;
  passwordChangedAt: string | null;
  twoFactorEnabled: false;
}
