import { initials } from "@/lib/format";
import type { UserProfileVM, SecurityVM } from "./types";

export function getUserProfile(): UserProfileVM {
  return {
    id: "usr_antonio",
    initials: initials("Antonio Ferreira"),
    name: "Antonio Ferreira",
    email: "antonio@dspaulo.com.br",
    username: "antonio.ferreira",
    lastLoginAt: "2026-06-15T09:41:00Z",
    createdAt: "2026-01-15T12:00:00Z",
    status: "ACTIVE",
    isStaff: false,
    memberships: [
      {
        pharmacyId: "pha_dsp",
        pharmacyName: "Drogaria São Paulo — Jardim Europa",
        role: "PHARMACY_MANAGER",
        isCurrent: true,
      },
      {
        pharmacyId: "pha_vida",
        pharmacyName: "Farmácia Vida Nova",
        role: "PHARMACY_VIEWER",
        isCurrent: false,
      },
    ],
  };
}

export function getSecurity(): SecurityVM {
  return {
    lastLoginAt: "2026-06-15T09:41:00Z",
    lastLoginDevice: "Chrome 126 — Windows 11",
    lastLoginIp: "187.45.xxx.xxx",
    passwordChangedAt: "2026-03-10T14:22:00Z",
    twoFactorEnabled: false,
  };
}

export function changePassword(current: string, newPassword: string): { success: boolean; error?: string } {
  if (current !== "12345678") {
    return { success: false, error: "Senha atual incorreta." };
  }
  if (newPassword === current) {
    return { success: false, error: "Nova senha deve ser diferente da atual." };
  }
  return { success: true };
}

export function updateProfile(name: string): { success: boolean } {
  void name;
  return { success: true };
}
