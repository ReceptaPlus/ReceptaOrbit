import type { Membership } from "@/types/domain";

/* 6 vínculos. Cenários: usr_antonio em 2 farmácias (switcher) · INVITED com
   expiração · SUSPENDED · OWNER/MANAGER/VIEWER presentes. UNIQUE(userId, pharmacyId). */
export const memberships: Membership[] = [
  { id: "mem_001", userId: "usr_antonio", pharmacyId: "pha_dsp", role: "MANAGER", status: "ACTIVE", lastAccessAt: "2026-06-15T09:30:00Z" },
  { id: "mem_002", userId: "usr_antonio", pharmacyId: "pha_vida", role: "OWNER", status: "ACTIVE", lastAccessAt: "2026-06-13T14:00:00Z" }, // 2ª farmácia → TenantSwitcher visível
  { id: "mem_003", userId: "usr_camila", pharmacyId: "pha_dsp", role: "OWNER", status: "ACTIVE", lastAccessAt: "2026-06-15T08:10:00Z" },
  { id: "mem_004", userId: "usr_daniel", pharmacyId: "pha_dsp", role: "VIEWER", status: "ACTIVE", lastAccessAt: "2026-06-14T16:00:00Z" },
  { id: "mem_005", userId: "usr_ana", pharmacyId: "pha_dsp", role: "VIEWER", status: "INVITED", invitedByUserId: "usr_camila", inviteExpiresAt: "2026-06-19T00:00:00Z" },
  { id: "mem_006", userId: "usr_daniel", pharmacyId: "pha_vida", role: "VIEWER", status: "SUSPENDED", lastAccessAt: "2026-05-30T11:00:00Z" },
];
