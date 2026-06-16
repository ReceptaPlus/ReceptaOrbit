import { conversationCycles } from "@/lib/mock-data";
import type { ConversationCycle } from "./types";

export function listCycles(): ConversationCycle[] {
  return conversationCycles as ConversationCycle[];
}

export function getCycle(id: string): ConversationCycle | undefined {
  return listCycles().find((c) => c.id === id);
}

export function countNeedsReview(): number {
  return listCycles().filter((c) => c.needsReview).length;
}
