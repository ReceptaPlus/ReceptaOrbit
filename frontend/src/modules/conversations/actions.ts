"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { getAuthorizedPharmacyContext } from "@/server/auth/dal";

/* Marca uma conversa como VISTA pelo usuário atual (sai do badge "não vistas").
   Idempotente. Verifica que o ciclo é do tenant antes de gravar. */
export async function markConversationReadAction(cycleId: string): Promise<void> {
  const { pharmacyId, userId } = await getAuthorizedPharmacyContext();
  const cycle = await db.conversationCycle.findFirst({
    where: { id: cycleId, pharmacyId },
    select: { id: true },
  });
  if (!cycle) return; // outro tenant / inexistente — ignora

  await db.conversationRead.upsert({
    where: { userId_cycleId: { userId, cycleId } },
    create: { userId, cycleId },
    update: { seenAt: new Date() },
  });
  // atualiza o badge do menu (computado no layout) e a lista.
  revalidatePath("/conversas");
}
