"use client";

/* Mock com a mesma assinatura que o Auth.js terá (useSession). */

export interface Session {
  user: { name: string; email: string; role: "RECEPTA_ADMIN" | "PHARMACY_MANAGER" | "PHARMACY_VIEWER" };
  pharmacy: { id: string; name: string };
}

export function useSession(): { data: Session; status: "authenticated" } {
  return {
    data: {
      user: { name: "Antonio Ferreira", email: "antonio@dspaulo.com.br", role: "PHARMACY_MANAGER" },
      pharmacy: { id: "ph-1", name: "Drogaria São Paulo" },
    },
    status: "authenticated",
  };
}
