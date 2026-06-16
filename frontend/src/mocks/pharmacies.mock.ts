import type { Pharmacy } from "@/types/domain";

/* 3 tenants. Thresholds distintos (0.85 e 0.70) testam needsReview relativo. */
export const pharmacies: Pharmacy[] = [
  {
    id: "pha_dsp",
    tradeName: "Drogaria São Paulo — Jardim Europa",
    legalName: "DSP Farma Ltda.",
    cnpj: "12.345.678/0001-90",
    timezone: "America/Sao_Paulo",
    plan: "PRO",
    status: "ACTIVE",
    aiSettings: { autoConfirmThreshold: 0.85, summaryLanguage: "pt-BR" },
  },
  {
    id: "pha_vida",
    tradeName: "Farmácia Vida — Centro",
    legalName: "Vida Saúde Comércio de Medicamentos Ltda.",
    cnpj: "98.765.432/0001-10",
    timezone: "America/Sao_Paulo",
    plan: "START",
    status: "ACTIVE",
    aiSettings: { autoConfirmThreshold: 0.7, summaryLanguage: "pt-BR" },
  },
  {
    id: "pha_bem",
    tradeName: "Drogaria Bem Estar — Tatuapé",
    legalName: "Bem Estar Farma Ltda.",
    cnpj: "45.678.901/0001-23",
    timezone: "America/Sao_Paulo",
    plan: "START",
    status: "ACTIVE",
    aiSettings: { autoConfirmThreshold: 0.85, summaryLanguage: "pt-BR" },
  },
];
