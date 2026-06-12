import { users } from "@/lib/mock-data";
import type { Integration, Pharmacy, PharmacyUser } from "./types";

export function listUsers(): PharmacyUser[] {
  return users as PharmacyUser[];
}

export function listIntegrations(): Integration[] {
  return [
    { id: "evolution", name: "Evolution API (WhatsApp)", detail: "Instância drogaria-sp-01 · +55 11 4002-8922", connected: true },
    { id: "meta", name: "Meta Ads", detail: "Conta act_2231… · sincronizado há 2h", connected: true },
    { id: "google", name: "Google Ads", detail: "Conecte para atribuição via GCLID", connected: false },
  ];
}

export function getPharmacy(): Pharmacy {
  return {
    tradeName: "Drogaria São Paulo — Jardim Europa",
    legalName: "DSP Farma Ltda.",
    cnpj: "12.345.678/0001-90",
    timezone: "America/Sao_Paulo",
  };
}
