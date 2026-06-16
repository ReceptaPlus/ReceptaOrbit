import type { WhatsAppConnection } from "@/types/domain";

/* 1 por tenant, espelhando os 3 estados relevantes (alimenta o GlobalBanner). */
export const whatsappConnections: WhatsAppConnection[] = [
  { pharmacyId: "pha_dsp", state: "CONNECTED", pairedNumber: "+551140028922", instanceName: "drogaria-sp-01", stateChangedAt: "2026-06-10T08:00:00Z" },
  { pharmacyId: "pha_vida", state: "DOWN", pairedNumber: "+551133337788", instanceName: "farmacia-vida-01", stateChangedAt: "2026-06-15T06:30:00Z" }, // dispara banner "caído desde"
  { pharmacyId: "pha_bem", state: "PAIRING", instanceName: "drogaria-bem-01", stateChangedAt: "2026-06-15T09:00:00Z", qrExpiresAt: "2026-06-15T09:01:00Z" },
];
