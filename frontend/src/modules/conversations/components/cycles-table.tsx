"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/badges";
import { WaitingBadge } from "@/components/waiting-badge";
import { ROUTES } from "@/lib/constants";
import type { CycleRowVM } from "../queries";

/* Tabela de conversas (V1, sem IA): contato, status, aguardando, nº de msgs, última msg. */
const columns: ColumnDef<CycleRowVM>[] = [
  {
    accessorKey: "contactName",
    header: "Contato",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.contactName}</p>
        <p className="text-xs text-muted">{row.original.phoneDisplay}</p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "waiting",
    header: "Aguardando",
    enableSorting: false,
    cell: ({ row }) => <WaitingBadge waiting={row.original.waiting} />,
  },
  {
    accessorKey: "lastMessagePreview",
    header: "Última mensagem",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-secondary line-clamp-1 max-w-xs">{row.original.lastMessagePreview}</span>
    ),
  },
  {
    accessorKey: "messageCount",
    header: () => <span className="block text-right">Msgs</span>,
    cell: ({ row }) => (
      <span className="block text-right tabular-nums" data-numeric>{row.original.messageCount}</span>
    ),
  },
  {
    accessorKey: "lastMessageTime",
    header: "Última msg.",
    enableSorting: false,
    cell: ({ row }) => <span className="text-secondary">{row.original.lastMessageTime}</span>,
  },
];

export function CyclesTable({ data }: { data: CycleRowVM[] }) {
  const router = useRouter();
  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={(c) => router.push(ROUTES.conversa(c.id))}
    />
  );
}
