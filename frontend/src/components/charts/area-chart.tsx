"use client";

import {
  Area,
  AreaChart as RAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Series {
  key: string;
  label: string;
  color: string;
}

interface AreaChartProps {
  data: Record<string, number | string>[];
  xKey: string;
  series: Series[];
  height?: number;
  format?: (v: number) => string;
}

/* Área suave estilo Stripe/Linear — gradiente tênue, grid discreto. */
export function AreaChart({ data, xKey, series, height = 240, format }: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RAreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D2" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#695C57" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#A89E99" }} axisLine={false} tickLine={false} width={48} />
        <Tooltip
          cursor={{ stroke: "#D4432C", strokeOpacity: 0.2 }}
          contentStyle={{ borderRadius: 10, border: "1px solid #E8E2D2", fontSize: 12, fontFamily: "inherit", boxShadow: "0 8px 32px rgba(10,13,12,.13)" }}
          formatter={((value: number, name: string) => [format ? format(value) : value, name]) as never}
        />
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            fill={`url(#grad-${s.key})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </RAreaChart>
    </ResponsiveContainer>
  );
}
