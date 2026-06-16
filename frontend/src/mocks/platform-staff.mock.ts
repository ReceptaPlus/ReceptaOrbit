import type { PlatformStaff } from "@/types/domain";

/* Papéis de plataforma — separados do tenant (anti-pattern 4 do DOMAIN-MODEL). */
export const platformStaff: PlatformStaff[] = [
  { userId: "usr_suporte", role: "PLATFORM_ADMIN" },
];
