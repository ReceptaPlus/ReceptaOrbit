import { dashboard, conversationCycles } from "@/lib/mock-data";
import { getSalesKpis } from "@/modules/sales/api";
import type { ConversationCycle } from "@/modules/conversations/types";

export function getDashboard() {
  const kpis = getSalesKpis();
  return {
    ...kpis,
    conversionRate: dashboard.conversionRate,
    openConversations: dashboard.openConversations,
    weekBars: dashboard.weekBars,
    topProducts: dashboard.topProducts,
    salesBySource: dashboard.salesBySource,
    recentCycles: (conversationCycles as ConversationCycle[]).slice(0, 5),
  };
}
