export type UserRole = "RECEPTA_ADMIN" | "PHARMACY_MANAGER" | "PHARMACY_VIEWER";
export type UserStatus = "ACTIVE" | "SUSPENDED";

export interface PharmacyUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: string;
}

export interface Integration {
  id: string;
  name: string;
  detail: string;
  connected: boolean;
}

export interface Pharmacy {
  tradeName: string;
  legalName: string;
  cnpj: string;
  timezone: string;
}
