import "server-only";
import { db } from "@/server/db";
import { getAuthorizedPharmacyContext } from "@/server/auth/dal";
import { formatBRL, formatDate } from "@/lib/format";
import type { CycleResult, ReportBody } from "./schemas";

/* Camada de dados da IA.
   (A) INGESTÃO — cross-tenant, chamada pelos endpoints internos que o n8n consome.
   (B) EXIBIÇÃO — escopo de tenant (getAuthorizedPharmacyContext), usada nas telas.
   O app não roda LLM: só serve as conversas e persiste o que o n8n devolve. */

// ── (A) Ingestão (cross-tenant; endpoints internos) ──────────────────────────

export interface PendingCycleDTO {
  cycleId: string;
  pharmacyId: string;
  contactName: string;
  lastMessageAt: string; // ISO
  messages: { direction: "INBOUND" | "OUTBOUND"; text: string; sentAt: string }[];
}

/* Ciclos a analisar: CLOSED (conversa encerrada — desfecho já definido) e ainda SEM
   análise. Ciclos novos sempre nascem em outro registro, então CLOSED é final; a
   coluna analyzedThroughMessageAt existe para suportar re-análise de OPEN no futuro.
   Mais antigos primeiro (fila justa). Limite controla custo/lote do n8n. */
export async function fetchPendingCycles(limit: number): Promise<PendingCycleDTO[]> {
  const cycles = await db.conversationCycle.findMany({
    where: { status: "CLOSED", analysis: { is: null } },
    orderBy: { lastMessageAt: "asc" },
    take: limit,
    include: {
      contact: { select: { name: true } },
      messages: { orderBy: { sentAt: "asc" }, select: { direction: true, textContent: true, sentAt: true } },
    },
  });

  return cycles
    .filter((c) => c.messages.length > 0)
    .map((c) => ({
      cycleId: c.id,
      pharmacyId: c.pharmacyId,
      contactName: c.contact.name,
      lastMessageAt: c.lastMessageAt.toISOString(),
      messages: c.messages.map((m) => ({
        direction: m.direction,
        text: m.textContent,
        sentAt: m.sentAt.toISOString(),
      })),
    }));
}

/* Grava o lote de análises (upsert idempotente por (cycleId, pharmacyId)). Transação:
   ou entra tudo, ou nada. Retorna quantas linhas foram afetadas. */
export async function saveCycleResults(results: CycleResult[]): Promise<number> {
  const now = new Date();
  await db.$transaction(
    results.map((r) =>
      db.cycleAnalysis.upsert({
        where: { cycleId_pharmacyId: { cycleId: r.cycleId, pharmacyId: r.pharmacyId } },
        create: {
          pharmacyId: r.pharmacyId,
          cycleId: r.cycleId,
          isSale: r.isSale,
          saleValueCents: r.saleValueCents ?? null,
          stage: r.stage ?? null,
          lossReason: r.lossReason ?? null,
          summary: r.summary,
          confidence: r.confidence,
          model: r.model,
          analyzedAt: now,
          analyzedThroughMessageAt: r.analyzedThroughMessageAt,
        },
        update: {
          isSale: r.isSale,
          saleValueCents: r.saleValueCents ?? null,
          stage: r.stage ?? null,
          lossReason: r.lossReason ?? null,
          summary: r.summary,
          confidence: r.confidence,
          model: r.model,
          analyzedAt: now,
          analyzedThroughMessageAt: r.analyzedThroughMessageAt,
        },
      }),
    ),
  );
  return results.length;
}

export interface ReportInputDTO {
  pharmacyId: string;
  tradeName: string;
  periodStart: string; // ISO
  periodEnd: string; // ISO
  salesCount: number;
  salesValueCents: number;
  conversationCount: number;
  conversionRate: number; // 0..1
}

const DAY_MS = 24 * 60 * 60 * 1000;

/* Snapshot por farmácia para o n8n só escrever a narrativa. Período = últimos `days`
   dias. Só farmácias ATIVAS com ao menos 1 conversa no período (sem dado, sem relatório).
   Vendas = análises com isSale cujo ciclo caiu na janela (lastMessageAt). */
export async function fetchReportInputs(days = 7): Promise<ReportInputDTO[]> {
  const periodEnd = new Date();
  const periodStart = new Date(periodEnd.getTime() - days * DAY_MS);
  const window = { gte: periodStart, lte: periodEnd };

  const pharmacies = await db.pharmacy.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, tradeName: true },
  });

  const rows = await Promise.all(
    pharmacies.map(async (p) => {
      const [conversationCount, salesAgg] = await Promise.all([
        db.conversationCycle.count({ where: { pharmacyId: p.id, lastMessageAt: window } }),
        db.cycleAnalysis.aggregate({
          where: { pharmacyId: p.id, isSale: true, cycle: { lastMessageAt: window } },
          _count: true,
          _sum: { saleValueCents: true },
        }),
      ]);
      if (conversationCount === 0) return null;
      const salesCount = salesAgg._count;
      return {
        pharmacyId: p.id,
        tradeName: p.tradeName,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        salesCount,
        salesValueCents: salesAgg._sum.saleValueCents ?? 0,
        conversationCount,
        conversionRate: conversationCount > 0 ? salesCount / conversationCount : 0,
      } satisfies ReportInputDTO;
    }),
  );

  return rows.filter((r): r is ReportInputDTO => r !== null);
}

/* Grava o relatório agregado (narrativa + snapshot). Append-only por período. */
export async function saveSalesReport(body: ReportBody): Promise<string> {
  const report = await db.salesReport.create({
    data: {
      pharmacyId: body.pharmacyId,
      periodStart: body.periodStart,
      periodEnd: body.periodEnd,
      narrative: body.narrative,
      salesCount: body.salesCount,
      salesValueCents: body.salesValueCents,
      conversationCount: body.conversationCount,
      conversionRate: body.conversionRate,
      model: body.model,
    },
    select: { id: true },
  });
  return report.id;
}

// ── (B) Exibição (escopo de tenant; telas) ───────────────────────────────────

export interface SaleRowVM {
  cycleId: string;
  contactName: string;
  valueDisplay: string | null; // "R$ 120,00" ou null se a IA não estimou
  summary: string;
  dateDisplay: string; // "29/06/2026"
}

export interface SalesReportVM {
  periodDisplay: string; // "22/06/2026 – 29/06/2026"
  narrative: string;
  salesCount: number;
  salesValueDisplay: string;
  conversationCount: number;
  conversionDisplay: string; // "12%"
  generatedAtDisplay: string;
}

/* Conversas que a IA marcou como venda (tela /vendas). */
export async function listSalesVM(): Promise<SaleRowVM[]> {
  const { pharmacyId } = await getAuthorizedPharmacyContext();
  const rows = await db.cycleAnalysis.findMany({
    where: { pharmacyId, isSale: true },
    orderBy: { analyzedAt: "desc" },
    take: 100,
    include: { cycle: { include: { contact: { select: { name: true } } } } },
  });
  return rows.map((r) => ({
    cycleId: r.cycleId,
    contactName: r.cycle.contact.name,
    valueDisplay: r.saleValueCents != null ? formatBRL(r.saleValueCents) : null,
    summary: r.summary,
    dateDisplay: formatDate(r.analyzedAt.toISOString()),
  }));
}

/* Relatório mais recente do dono (tela /vendas). Null = IA ainda não gerou. */
export async function getLatestSalesReportVM(): Promise<SalesReportVM | null> {
  const { pharmacyId } = await getAuthorizedPharmacyContext();
  const r = await db.salesReport.findFirst({ where: { pharmacyId }, orderBy: { generatedAt: "desc" } });
  if (!r) return null;
  return {
    periodDisplay: `${formatDate(r.periodStart.toISOString())} – ${formatDate(r.periodEnd.toISOString())}`,
    narrative: r.narrative,
    salesCount: r.salesCount,
    salesValueDisplay: formatBRL(r.salesValueCents),
    conversationCount: r.conversationCount,
    conversionDisplay: `${Math.round(r.conversionRate * 100)}%`,
    generatedAtDisplay: formatDate(r.generatedAt.toISOString()),
  };
}
