import "server-only";
import { db } from "@/server/db";
import { getAuthorizedPharmacyContext } from "@/server/auth/dal";
import { formatPhone, maskPhone, formatTime } from "@/lib/format";
import type { TenantRole } from "@/types/domain";

/* Camada de dados V1 (sem IA) — Conversas. Lê do Prisma, escopo de tenant garantido
   server-side. Status armazenado = OPEN/CLOSED; "aguardando" é DERIVADO aqui (direção
   da última msg). Sem stage/outcome/confiança/valor (entram com a IA).
   Núcleo (pharmacyId, role) é puro/testável; wrappers resolvem o contexto. */

export type Waiting = "CUSTOMER" | "PHARMACY" | null;

export interface CycleRowVM {
  id: string;
  contactId: string;
  contactName: string;
  phoneDisplay: string;
  status: "OPEN" | "CLOSED";
  waiting: Waiting; // derivado: última msg INBOUND → farmácia deve responder
  messageCount: number;
  lastMessageTime: string; // "14:51"
  lastMessagePreview: string;
}

export interface CycleAttributionVM {
  source: string;
  method: string;
  confidence: number;
  campaignName?: string;
}

export interface CycleDetailVM {
  id: string;
  contactId: string;
  contactName: string;
  phoneDisplay: string;
  status: "OPEN" | "CLOSED";
  waiting: Waiting;
  attribution: CycleAttributionVM | null;
  messages: { id: string; direction: "INBOUND" | "OUTBOUND"; text: string; time: string }[];
}

function phoneDisplay(role: TenantRole, e164: string): string {
  return role === "VIEWER" ? maskPhone(e164) : formatPhone(e164);
}

function deriveWaiting(status: string, lastDirection: "INBOUND" | "OUTBOUND" | undefined): Waiting {
  if (status !== "OPEN" || !lastDirection) return null;
  return lastDirection === "INBOUND" ? "PHARMACY" : "CUSTOMER";
}

export async function fetchCycleRows(pharmacyId: string, role: TenantRole): Promise<CycleRowVM[]> {
  const cycles = await db.conversationCycle.findMany({
    where: { pharmacyId },
    orderBy: { lastMessageAt: "desc" },
    include: {
      contact: { select: { id: true, name: true, phoneE164: true } },
      _count: { select: { messages: true } },
      messages: { orderBy: { sentAt: "desc" }, take: 1, select: { direction: true, textContent: true } },
    },
  });

  return cycles.map((c) => {
    const last = c.messages[0];
    return {
      id: c.id,
      contactId: c.contactId,
      contactName: c.contact.name,
      phoneDisplay: phoneDisplay(role, c.contact.phoneE164),
      status: c.status === "OPEN" ? "OPEN" : "CLOSED",
      waiting: deriveWaiting(c.status, last?.direction),
      messageCount: c._count.messages,
      lastMessageTime: formatTime(c.lastMessageAt.toISOString()),
      lastMessagePreview: last?.textContent ?? "",
    };
  });
}

export async function fetchCycleDetail(
  pharmacyId: string,
  role: TenantRole,
  cycleId: string,
): Promise<CycleDetailVM | null> {
  const cycle = await db.conversationCycle.findFirst({
    where: { id: cycleId, pharmacyId },
    include: {
      contact: { select: { id: true, name: true, phoneE164: true } },
      messages: { orderBy: { sentAt: "asc" }, select: { id: true, direction: true, textContent: true, sentAt: true } },
    },
  });
  if (!cycle) return null;

  const last = cycle.messages[cycle.messages.length - 1];
  return {
    id: cycle.id,
    contactId: cycle.contactId,
    contactName: cycle.contact.name,
    phoneDisplay: phoneDisplay(role, cycle.contact.phoneE164),
    status: cycle.status === "OPEN" ? "OPEN" : "CLOSED",
    waiting: deriveWaiting(cycle.status, last?.direction),
    attribution: (cycle.attribution as CycleAttributionVM | null) ?? null,
    messages: cycle.messages.map((m) => ({
      id: m.id,
      direction: m.direction,
      text: m.textContent,
      time: formatTime(m.sentAt.toISOString()),
    })),
  };
}

/** Lista de conversas do tenant atual. */
export async function listConversationsVM(): Promise<CycleRowVM[]> {
  const { pharmacyId, role } = await getAuthorizedPharmacyContext();
  return fetchCycleRows(pharmacyId, role);
}

/** Detalhe de uma conversa do tenant atual (null = não encontrada/outro tenant). */
export async function getConversationVM(cycleId: string): Promise<CycleDetailVM | null> {
  const { pharmacyId, role } = await getAuthorizedPharmacyContext();
  return fetchCycleDetail(pharmacyId, role, cycleId);
}
