"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { listPendingSales } from "@/modules/sales/api";
import { SOURCE_LABEL, ROUTES } from "@/lib/constants";
import { formatBRL } from "@/lib/format";
import { ConfidencePill, SourceBadge } from "@/components/badges";
import { getCycle } from "@/modules/conversations/api";

export default function RevisaoPage() {
  const router = useRouter();
  const pending = listPendingSales();
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState<string[]>([]);

  const queue = pending.filter((s) => !done.includes(s.id));
  const sale = queue[Math.min(index, queue.length - 1)];

  function resolve(action: "confirm" | "reject") {
    if (!sale) return;
    setDone((d) => [...d, sale.id]);
    setIndex(0);
    toast.success(
      action === "confirm"
        ? `Venda de ${sale.contactName} confirmada — ${formatBRL(sale.netAmountCents)}`
        : `Marcada como "não foi venda"`
    );
  }

  useKeyboardShortcut("c", () => resolve("confirm"), { enabled: !!sale });
  useKeyboardShortcut("x", () => resolve("reject"), { enabled: !!sale });

  if (!sale) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-12 h-12 rounded-full bg-success-bg text-success-text flex items-center justify-center text-xl mb-4">
          ✓
        </div>
        <h1 className="font-display text-title font-semibold">Tudo revisado</h1>
        <p className="text-sm text-secondary mt-1 mb-6">Nenhuma venda pendente de revisão.</p>
        <Button variant="outline" onClick={() => router.push(ROUTES.vendas)}>
          Voltar para Vendas
        </Button>
      </div>
    );
  }

  const cycle = getCycle(sale.conversationCycleId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <Link href={ROUTES.vendas} className="text-sm text-secondary hover:text-primary">
            ← Vendas
          </Link>
          <h1 className="text-2xl font-bold font-display mt-1">Revisão de vendas</h1>
        </div>
        <span className="text-sm text-secondary">{queue.length} restante{queue.length === 1 ? "" : "s"}</span>
      </header>

      <div className="bg-card rounded-xl border border-line p-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold font-display">{sale.contactName}</p>
            <p className="text-xs text-secondary mt-0.5">
              {SOURCE_LABEL[sale.attributionSource]}
              {sale.campaignName ? ` · ${sale.campaignName}` : ""}
            </p>
          </div>
          <SourceBadge source={sale.attributionSource} />
        </div>

        <div className="rounded-lg bg-subtle border border-line-subtle p-4">
          <p className="text-xs text-secondary mb-1">Valor sugerido pela IA</p>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold font-display" data-numeric>
              {formatBRL(sale.netAmountCents)}
            </span>
            <ConfidencePill value={sale.confidence} />
          </div>
          <ul className="mt-3 space-y-1">
            {sale.items.map((i) => (
              <li key={i.productName} className="text-sm text-secondary">
                {i.quantity}× {i.productName} — {formatBRL(i.totalPriceCents)}
              </li>
            ))}
          </ul>
        </div>

        {cycle && (
          <div>
            <p className="text-xs text-secondary mb-2">Resumo da conversa</p>
            <p className="text-sm leading-relaxed">{cycle.aiSummary}</p>
            <Link
              href={ROUTES.conversa(cycle.id)}
              className="inline-block text-xs text-primary hover:underline mt-2"
            >
              Ver conversa completa →
            </Link>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-line-subtle">
          <Button className="flex-1" onClick={() => resolve("confirm")}>
            ✓ Confirmar <span className="ml-1 opacity-60 text-xs">C</span>
          </Button>
          <Button variant="outline" className="flex-1">
            ✎ Ajustar valor <span className="ml-1 opacity-60 text-xs">E</span>
          </Button>
          <Button
            variant="outline"
            className="flex-1 hover:border-danger-text hover:text-danger-text"
            onClick={() => resolve("reject")}
          >
            ✗ Não foi venda <span className="ml-1 opacity-60 text-xs">X</span>
          </Button>
        </div>
      </div>

      <div className="flex justify-center gap-1.5">
        {pending.map((s) => (
          <span
            key={s.id}
            className={`w-2 h-2 rounded-full ${
              done.includes(s.id) ? "bg-success-500" : s.id === sale.id ? "bg-primary" : "bg-line"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
