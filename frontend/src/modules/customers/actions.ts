"use server";

import { db } from "@/server/db";
import { getAuthorizedPharmacyContext } from "@/server/auth/dal";
import { formatPhone, maskPhone } from "@/lib/format";

export interface ContactSearchItem {
  id: string;
  name: string;
  phoneDisplay: string;
}

/* Contatos reais do tenant p/ a busca (paleta). Escopo por pharmacyId server-side;
   telefone mascarado p/ VIEWER. Limitado — a paleta filtra client-side por texto. */
export async function listTenantContactsAction(): Promise<ContactSearchItem[]> {
  const { pharmacyId, role } = await getAuthorizedPharmacyContext();
  const contacts = await db.contact.findMany({
    where: { pharmacyId },
    orderBy: { lastSeenAt: "desc" },
    take: 500,
    select: { id: true, name: true, phoneE164: true },
  });
  return contacts.map((c) => ({
    id: c.id,
    name: c.name,
    phoneDisplay: role === "VIEWER" ? maskPhone(c.phoneE164) : formatPhone(c.phoneE164),
  }));
}
