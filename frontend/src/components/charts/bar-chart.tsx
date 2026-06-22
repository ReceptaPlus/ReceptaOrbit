"use client";

import {
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  /** Texto após o valor no tooltip (ex.: "vendas"). */
  unit?: string;
}

export function BarChart({ data, height = 160, unit = "" }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RBarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -20 }} barCategoryGap="22%">
        <defs>
          <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4432C" />
            <stop offset="100%" stopColor="#E2795F" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ECE6DA" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#695C57" }} axisLine={false} tickLine={false} dy={4} />
        <YAxis tick={{ fontSize: 11, fill: "#A89E99" }} axisLine={false} tickLine={false} width={40} />
        <Tooltip
          cursor={{ fill: "rgba(212,67,44,0.06)" }}
          contentStyle={{
            borderRadius: 10,
            border: "1px solid #E8E2D2",
            fontSize: 12,
            fontFamily: "inherit",
            boxShadow: "0 8px 32px rgba(10,13,12,.13)",
          }}
          formatter={(value) => [`${value}${unit ? ` ${unit}` : ""}`, ""]}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
          {data.map((d, i) => (
            <Cell key={i} fill="url(#bar-grad)" fillOpacity={0.55 + 0.45 * (d.value / max)} />
          ))}
        </Bar>
      </RBarChart>
    </ResponsiveContainer>
  );
}
