import "server-only";
import { db } from "@/server/db";
import { getAuthorizedPharmacyContext } from "@/server/auth/dal";
import { getAdsByClientId, getAdsByPharmacyName, type AdsSummary } from "@/server/agente/ads";

/* Camada de dados V1 (sem IA) — Dashboard de VOLUME. Sem KPIs de venda
   (total vendido/ticket/conversão) — entram com a IA/vendas. */

export interface DashboardVolumeVM {
  activeConversations: number; // ciclos OPEN
  newContacts7d: number;
  messages7d: number; // só RECEBIDAS (INBOUND)
  closedCycles7d: number;
  msgsPerDay: { label: string; value: number }[]; // últimos 7 dias, só RECEBIDAS
}

const DAY_MS = 24 * 60 * 60 * 1000;

export async function fetchDashboardVolume(pharmacyId: string): Promise<DashboardVolumeVM> {
  const now = new Date();
  const since = new Date(now.getTime() - 7 * DAY_MS);

  const [activeConversations, newContacts7d, messages7d, closedCycles7d, recentMsgs] = await Promise.all([
    db.conversationCycle.count({ where: { pharmacyId, status: "OPEN" } }),
    db.contact.count({ where: { pharmacyId, firstSeenAt: { gte: since } } }),
    db.message.count({ where: { pharmacyId, direction: "INBOUND", sentAt: { gte: since } } }),
    db.conversationCycle.count({ where: { pharmacyId, status: "CLOSED", updatedAt: { gte: since } } }),
    db.message.findMany({ where: { pharmacyId, direction: "INBOUND", sentAt: { gte: since } }, select: { sentAt: true } }),
  ]);

  // Buckets dos últimos 7 dias (UTC), do mais antigo ao mais recente.
  const buckets = new Map<string, number>();
  const order: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * DAY_MS);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, 0);
    order.push(key);
  }
  for (const m of recentMsgs) {
    const key = m.sentAt.toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  const msgsPerDay = order.map((key) => {
    const [, mm, dd] = key.split("-");
    return { label: `${dd}/${mm}`, value: buckets.get(key) ?? 0 };
  });

  return { activeConversations, newContacts7d, messages7d, closedCycles7d, msgsPerDay };
}

export async function getDashboardVolumeVM(): Promise<DashboardVolumeVM> {
  const { pharmacyId } = await getAuthorizedPharmacyContext();
  return fetchDashboardVolume(pharmacyId);
}

/* Cards de anúncio (Meta+Google) — reuso read-only do banco do Agente-Meta-Ads.
   Mapeamento por NOME da farmácia (tradeName) → Client do Agente. Null = sem Agente
   configurado, sem match, ou falha (cards somem; dashboard de volume não depende disto). */
export async function getAdsCardsVM(days = 7): Promise<AdsSummary | null> {
  const { pharmacyId } = await getAuthorizedPharmacyContext();
  const pharmacy = await db.pharmacy.findUnique({
    where: { id: pharmacyId },
    select: { tradeName: true, agenteClientId: true },
  });
  if (!pharmacy) return null;
  // Vínculo explícito (admin) é o caminho preferido; nome é fallback legado.
  if (pharmacy.agenteClientId) return getAdsByClientId(pharmacy.agenteClientId, days);
  return getAdsByPharmacyName(pharmacy.tradeName, days);
}
