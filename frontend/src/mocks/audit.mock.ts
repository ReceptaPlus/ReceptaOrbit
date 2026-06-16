import type { AuditLog } from "@/types/domain";

/* 8 entradas (append-only). Cenários: correção de classificação (before/after) ·
   correção de valor · confirmação de venda · convite · threshold alterado ·
   suspensão · ação de STAFF com onBehalfOf (aud_008). */
export const auditLogs: AuditLog[] = [
  { id: "aud_001", pharmacyId: "pha_dsp", actor: { type: "USER", userId: "usr_antonio" }, action: "CLASSIFICATION_CORRECTED", entityRef: { type: "AIAnalysis", id: "ana_006b" }, before: { estimatedValueCents: 21000 }, after: { estimatedValueCents: 18900 }, at: "2026-06-12T11:00:00Z" },
  { id: "aud_002", pharmacyId: "pha_dsp", actor: { type: "USER", userId: "usr_camila" }, action: "SALE_VALUE_CORRECTED", entityRef: { type: "Sale", id: "sal_1039" }, before: { amountCents: 5200 }, after: { amountCents: 4800 }, at: "2026-06-10T11:55:00Z" },
  { id: "aud_003", pharmacyId: "pha_dsp", actor: { type: "USER", userId: "usr_camila" }, action: "SALE_CONFIRMED", entityRef: { type: "Sale", id: "sal_1039" }, before: { status: "PENDING_REVIEW" }, after: { status: "CONFIRMED" }, at: "2026-06-10T12:00:00Z" },
  { id: "aud_004", pharmacyId: "pha_dsp", actor: { type: "USER", userId: "usr_camila" }, action: "USER_INVITED", entityRef: { type: "Membership", id: "mem_005" }, before: null, after: { userId: "usr_ana", role: "VIEWER", status: "INVITED" }, at: "2026-06-12T13:00:00Z" },
  { id: "aud_005", pharmacyId: "pha_dsp", actor: { type: "USER", userId: "usr_antonio" }, action: "AI_THRESHOLD_CHANGED", entityRef: { type: "Pharmacy", id: "pha_dsp" }, before: { autoConfirmThreshold: 0.8 }, after: { autoConfirmThreshold: 0.85 }, at: "2026-06-11T10:00:00Z" },
  { id: "aud_006", pharmacyId: "pha_dsp", actor: { type: "USER", userId: "usr_antonio" }, action: "WHATSAPP_CONNECTED", entityRef: { type: "WhatsAppConnection", id: "pha_dsp" }, before: { state: "PAIRING" }, after: { state: "CONNECTED" }, at: "2026-06-10T08:00:00Z" },
  { id: "aud_007", pharmacyId: "pha_vida", actor: { type: "USER", userId: "usr_antonio" }, action: "MEMBERSHIP_SUSPENDED", entityRef: { type: "Membership", id: "mem_006" }, before: { status: "ACTIVE" }, after: { status: "SUSPENDED" }, at: "2026-05-30T11:05:00Z" },
  // Ação de STAFF: sempre com onBehalfOf (tenant alvo):
  { id: "aud_008", pharmacyId: "pha_dsp", actor: { type: "USER", userId: "usr_suporte", onBehalfOf: "pha_dsp" }, action: "PHARMACY_UPDATED", entityRef: { type: "Pharmacy", id: "pha_dsp" }, before: { plan: "START" }, after: { plan: "PRO" }, at: "2026-06-01T09:00:00Z" },
];
