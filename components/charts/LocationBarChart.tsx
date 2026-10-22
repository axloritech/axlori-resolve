"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import ChartShell from "@/components/charts/ChartShell";
import { CHART, TOOLTIP_STYLE } from "@/components/charts/charts-shared";
import type { LocationCount } from "@/types";

export default function LocationBarChart({
  data,
  title = "Most reported locations",
  a11ySummary,
  limit = 6,
}: {
  data: LocationCount[];
  title?: string;
  a11ySummary: string;
  limit?: number;
}) {
  const rows = data.slice(0, limit);
  return (
    <ChartShell title={title} a11ySummary={a11ySummary} height={Math.max(220, rows.length * 46 + 40)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: CHART.axis }} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="location"
            tick={{ fontSize: 12, fill: CHART.axis }}
            tickLine={false}
            axisLine={false}
            width={150}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => [`${value} reports`, "Count"]} />
          <Bar dataKey="count" name="Reports" fill={CHART.submitted} radius={[0, 6, 6, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
