import type { User } from "@/types/domain";

/* 5 identidades. Staff (usr_suporte) NUNCA aparece em memberships de tenant. */
export const users: User[] = [
  { id: "usr_antonio", name: "Antonio Ferreira", email: "antonio@dspaulo.com.br", createdAt: "2026-01-15T12:00:00Z" }, // sessão default — MANAGER em pha_dsp, OWNER em pha_vida (switcher)
  { id: "usr_camila", name: "Camila Ramos", email: "camila@dspaulo.com.br", createdAt: "2026-01-20T12:00:00Z" }, // OWNER pha_dsp
  { id: "usr_daniel", name: "Daniel Melo", email: "daniel@dspaulo.com.br", createdAt: "2026-02-10T12:00:00Z" }, // VIEWER pha_dsp
  { id: "usr_ana", name: "Ana Souza", email: "ana@dspaulo.com.br", createdAt: "2026-06-12T12:00:00Z" }, // convidada (INVITED, sem 1º acesso)
  { id: "usr_suporte", name: "Suporte Recepta", email: "suporte@receptaplus.com.br", createdAt: "2025-12-01T12:00:00Z" }, // PLATFORM_ADMIN
];
