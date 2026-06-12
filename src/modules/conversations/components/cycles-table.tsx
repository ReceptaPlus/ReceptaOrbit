"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/tables/data-table";
import {
  ConfidencePill,
  OutcomeBadge,
  SourceBadge,
  StageBadge,
  StatusBadge,
} from "@/components/badges";
import { formatBRL, formatTime } from "@/lib/format";
import { ROUTES } from "@/lib/constants";
import type { ConversationCycle } from "../types";

const columns: ColumnDef<ConversationCycle>[] = [
  {
    accessorKey: "contactName",
    header: "Contato",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.contactName}</p>
        <p className="text-xs text-muted">{row.original.phone}</p>
      </div>
    ),
  },
  {
    accessorKey: "attribution.source",
    header: "Origem",
    enableSorting: false,
    cell: ({ row }) => <SourceBadge source={row.original.attribution.source} />,
  },
  {
    accessorKey: "stage",
    header: "Etapa",
    enableSorting: false,
    cell: ({ row }) => <StageBadge stage={row.original.stage} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "outcome",
    header: "Resultado",
    enableSorting: false,
    cell: ({ row }) => <OutcomeBadge outcome={row.original.outcome} />,
  },
  {
    accessorKey: "estimatedValueCents",
    header: () => <span className="block text-right">Valor</span>,
    cell: ({ row }) => (
      <span className="block text-right font-medium" data-numeric>
        {row.original.estimatedValueCents != null
          ? formatBRL(row.original.estimatedValueCents)
          : "—"}
      </span>
    ),
  },
  {
    accessorKey: "lastMessageAt",
    header: "Última msg.",
    cell: ({ row }) => (
      <span className="text-secondary">{formatTime(row.original.lastMessageAt)}</span>
    ),
  },
  {
    accessorKey: "aiConfidence",
    header: "Confiança",
    cell: ({ row }) => <ConfidencePill value={row.original.aiConfidence} />,
  },
  {
    id: "review",
    header: "",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.needsReview ? (
        <span className="inline-flex items-center rounded-full bg-warning-bg text-warning-text px-2.5 py-0.5 text-xs font-medium">
          Revisar
        </span>
      ) : null,
  },
];

export function CyclesTable({ data }: { data: ConversationCycle[] }) {
  const router = useRouter();

  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={(c) => router.push(ROUTES.conversa(c.id))}
      rowClassName={(c) => (c.needsReview ? "bg-cream-50" : undefined)}
    />
  );
}
