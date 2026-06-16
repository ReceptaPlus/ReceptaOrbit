import { sales } from "@/lib/mock-data";
import type { Sale } from "./types";

export function listSales(): Sale[] {
  return sales as Sale[];
}

export function listPendingSales(): Sale[] {
  return listSales().filter((s) => s.status === "PENDING_REVIEW");
}

export function getSalesKpis() {
  const confirmed = listSales().filter((s) => s.status === "CONFIRMED");
  const total = confirmed.reduce((a, s) => a + s.netAmountCents, 0);
  return {
    totalSoldCents: total,
    confirmedCount: confirmed.length,
    avgTicketCents: confirmed.length ? Math.round(total / confirmed.length) : 0,
    pendingCount: listPendingSales().length,
  };
}
