"use client";

import {
  Bar,
  BarChart as RBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
}

export function BarChart({ data, height = 160 }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RBarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: -28 }}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "#695C57" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 10, fill: "#A89E99" }} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: "rgba(212,67,44,0.06)" }}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #E8E2D2",
            fontSize: 12,
            fontFamily: "inherit",
          }}
          formatter={(value) => [`${value} conversas`, ""]}
        />
        <Bar dataKey="value" fill="#D4432C" radius={[3, 3, 0, 0]} maxBarSize={28} />
      </RBarChart>
    </ResponsiveContainer>
  );
}
