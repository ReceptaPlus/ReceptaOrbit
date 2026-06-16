import type { SessionRole } from "@/types/domain";

/* Sessão simulada — mutável pelo DevSwitcher (módulo tenancy gerencia o store).
   Em produção, isto vem do Auth.js. role pode ser tenant (OWNER/MANAGER/VIEWER)
   ou plataforma (PLATFORM_ADMIN/PLATFORM_SUPPORT); para staff, currentPharmacyId
   é null (área /admin) ou um tenant quando o staff entra como suporte (onBehalfOf). */
export interface SessionState {
  currentUserId: string;
  currentPharmacyId: string | null;
  role: SessionRole;
}

export const initialSession: SessionState = {
  currentUserId: "usr_antonio",
  currentPharmacyId: "pha_dsp",
  role: "MANAGER",
};
