"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface DonutDatum {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({ data, height = 168, centerLabel = "vendas" }: { data: DonutDatum[]; height?: number; centerLabel?: string }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-5">
      <div className="relative shrink-0" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="64%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((d) => (
                <Cell key={d.label} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 10, border: "1px solid #E8E2D2", fontSize: 12, fontFamily: "inherit" }}
              formatter={((value: number, name: string) => [`${Math.round((value / Math.max(1, total)) * 100)}%`, name]) as never}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-title font-bold text-ink" data-numeric>
            {total}
          </span>
          <span className="text-micro text-muted">{centerLabel}</span>
        </div>
      </div>
      <ul className="w-full min-w-0 space-y-2">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2.5 text-small">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
            <span className="min-w-0 flex-1 truncate text-secondary">{d.label}</span>
            <span className="shrink-0 font-semibold text-ink" data-numeric>
              {Math.round((d.value / Math.max(1, total)) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
