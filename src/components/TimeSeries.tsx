"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { INK } from "@/lib/chart-colors";

export function TimeSeries({ data }: { data: { key: string; value: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-zinc-500">Sin datos todavía.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="tsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a78d6" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#2a78d6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={INK.gridline} />
        <XAxis
          dataKey="key"
          tick={{ fontSize: 11, fill: INK.muted }}
          axisLine={{ stroke: INK.baseline }}
          tickLine={false}
          minTickGap={40}
        />
        <YAxis
          tick={{ fontSize: 11, fill: INK.muted }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: `1px solid ${INK.gridline}`,
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#2a78d6"
          strokeWidth={2}
          fill="url(#tsFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
