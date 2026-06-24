"use client";

import { useState } from "react";
import Link from "next/link";
import type { ContactRowVM } from "@/modules/customers/queries";

function tagFor(count: number): { label: string; cls: string } {
  if (count >= 4) return { label: "VIP", cls: "bg-brand-50 text-brand-600" };
  if (count >= 2) return { label: "Recorrente", cls: "bg-success-bg text-success-text" };
  return { label: "Novo", cls: "bg-info-bg text-info-text" };
}

/* Tabela de clientes com busca real (filtra nome/telefone client-side sobre dados reais). */
export function ClientesTable({ rows }: { rows: ContactRowVM[] }) {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const filtered = term
    ? rows.filter(
        (r) => r.name.toLowerCase().includes(term) || r.phoneDisplay.toLowerCase().includes(term),
      )
    : rows;

  return (
    <div className="space-y-4">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome ou telefone…"
          className="w-72 max-w-full rounded-lg border border-line bg-white/70 py-2 pl-9 pr-3.5 text-small backdrop-blur outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15"
        />
      </div>

      {rows.length === 0 ? (
        <div className="card-premium p-10 text-center">
          <p className="font-display font-medium text-ink">Nenhum contato ainda</p>
          <p className="mt-1 text-small text-secondary">Os contatos surgem na primeira mensagem recebida.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-premium p-10 text-center">
          <p className="font-display font-medium text-ink">Nenhum cliente encontrado</p>
          <p className="mt-1 text-small text-secondary">Ajuste a busca por nome ou telefone.</p>
        </div>
      ) : (
        <div className="card-premium animate-fade-in-up overflow-x-auto p-0">
          <table className="row-stagger w-full text-small">
            <thead>
              <tr className="border-b border-line text-left text-caption font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3.5">Cliente</th>
                <th className="px-5 py-3.5">Telefone</th>
                <th className="px-5 py-3.5">Primeiro contato</th>
                <th className="px-5 py-3.5">Último contato</th>
                <th className="px-5 py-3.5 text-right">Conversas</th>
                <th className="px-5 py-3.5 text-right">Tag</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const tag = tagFor(c.conversationCount);
                return (
                  <tr key={c.id} className="border-b border-line-subtle transition-colors last:border-0 hover:bg-cream-alt/40">
                    <td className="px-5 py-3.5">
                      <Link href={`/clientes/${c.id}`} className="flex items-center gap-3 font-medium text-ink hover:text-brand-500">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/90 to-brand-400 text-micro font-semibold text-white">
                          {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                        </span>
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-secondary" data-numeric>{c.phoneDisplay}</td>
                    <td className="px-5 py-3.5 text-secondary">{c.firstSeen}</td>
                    <td className="px-5 py-3.5 text-secondary">{c.lastSeen}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-ink" data-numeric>{c.conversationCount}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-micro font-semibold ${tag.cls}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                        {tag.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
