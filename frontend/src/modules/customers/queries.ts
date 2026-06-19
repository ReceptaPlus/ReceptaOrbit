import "server-only";
import { db } from "@/server/db";
import { getAuthorizedPharmacyContext } from "@/server/auth/dal";
import { formatPhone, maskPhone, formatDate, formatTime } from "@/lib/format";
import type { TenantRole } from "@/types/domain";

/* Camada de dados V1 (sem IA) — Clientes (Contacts). conversationCount é projeção
   (count de ciclos). purchaseCount/totalSpent ficam fora da V1 (sem vendas). */

export interface ContactRowVM {
  id: string;
  name: string;
  phoneDisplay: string;
  firstSeen: string;
  lastSeen: string;
  conversationCount: number;
}

export interface ContactDetailVM extends ContactRowVM {
  notes: string | null;
  cycles: { id: string; status: "OPEN" | "CLOSED"; lastMessageTime: string; messageCount: number }[];
}

function phoneDisplay(role: TenantRole, e164: string): string {
  return role === "VIEWER" ? maskPhone(e164) : formatPhone(e164);
}

export async function fetchContactRows(pharmacyId: string, role: TenantRole): Promise<ContactRowVM[]> {
  const contacts = await db.contact.findMany({
    where: { pharmacyId },
    orderBy: { lastSeenAt: "desc" },
    include: { _count: { select: { cycles: true } } },
  });
  return contacts.map((c) => ({
    id: c.id,
    name: c.name,
    phoneDisplay: phoneDisplay(role, c.phoneE164),
    firstSeen: formatDate(c.firstSeenAt.toISOString()),
    lastSeen: formatDate(c.lastSeenAt.toISOString()),
    conversationCount: c._count.cycles,
  }));
}

export async function fetchContactDetail(
  pharmacyId: string,
  role: TenantRole,
  contactId: string,
): Promise<ContactDetailVM | null> {
  const c = await db.contact.findFirst({
    where: { id: contactId, pharmacyId },
    include: {
      _count: { select: { cycles: true } },
      cycles: {
        orderBy: { lastMessageAt: "desc" },
        select: { id: true, status: true, lastMessageAt: true, _count: { select: { messages: true } } },
      },
    },
  });
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    phoneDisplay: phoneDisplay(role, c.phoneE164),
    firstSeen: formatDate(c.firstSeenAt.toISOString()),
    lastSeen: formatDate(c.lastSeenAt.toISOString()),
    conversationCount: c._count.cycles,
    notes: c.notes,
    cycles: c.cycles.map((cy) => ({
      id: cy.id,
      status: cy.status === "OPEN" ? "OPEN" : "CLOSED",
      lastMessageTime: formatTime(cy.lastMessageAt.toISOString()),
      messageCount: cy._count.messages,
    })),
  };
}

export async function listCustomersVM(): Promise<ContactRowVM[]> {
  const { pharmacyId, role } = await getAuthorizedPharmacyContext();
  return fetchContactRows(pharmacyId, role);
}

export async function getCustomerVM(contactId: string): Promise<ContactDetailVM | null> {
  const { pharmacyId, role } = await getAuthorizedPharmacyContext();
  return fetchContactDetail(pharmacyId, role, contactId);
}
