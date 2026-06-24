"use client";

import { useEffect } from "react";
import { markConversationReadAction } from "@/modules/conversations/actions";

/* Dispara a marcação de "visto" ao abrir a conversa (efeito, não no render do
   server — evita marcar durante prefetch). Não renderiza nada. */
export function MarkConversationRead({ cycleId }: { cycleId: string }) {
  useEffect(() => {
    markConversationReadAction(cycleId);
  }, [cycleId]);
  return null;
}
