import "server-only";
import { db } from "@/server/db";
import { getAuthorizedPharmacyContext } from "@/server/auth/dal";
import { formatDate, formatTime } from "@/lib/format";

/* Leitura do estado da conexão WhatsApp do tenant atual (tabela WhatsAppConnection).
   O worker sincroniza o estado via eventos connection.update; a tela mostra o último
   estado conhecido + permite (re)parear/desconectar via Evolution. */

export type WhatsAppState = "DISCONNECTED" | "PAIRING" | "CONNECTED" | "DOWN";

export interface WhatsAppStatusVM {
  state: WhatsAppState;
  pairedNumber: string | null;
  instanceName: string | null;
  sinceDisplay: string | null;
}

const LABEL: Record<WhatsAppState, string> = {
  DISCONNECTED: "Desconectado",
  PAIRING: "Pareando",
  CONNECTED: "Conectado",
  DOWN: "Fora do ar",
};

export function whatsAppStateLabel(s: WhatsAppState): string {
  return LABEL[s];
}

export async function getWhatsAppStatusVM(): Promise<WhatsAppStatusVM> {
  const { pharmacyId } = await getAuthorizedPharmacyContext();
  const conn = await db.whatsAppConnection.findUnique({ where: { pharmacyId } });
  if (!conn) {
    return { state: "DISCONNECTED", pairedNumber: null, instanceName: null, sinceDisplay: null };
  }
  return {
    state: conn.state as WhatsAppState,
    pairedNumber: conn.pairedNumber,
    instanceName: conn.instanceName,
    sinceDisplay: `${formatDate(conn.stateChangedAt.toISOString())} ${formatTime(conn.stateChangedAt.toISOString())}`,
  };
}
