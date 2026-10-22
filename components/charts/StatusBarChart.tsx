"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import ChartShell from "@/components/charts/ChartShell";
import { CHART, TOOLTIP_STYLE } from "@/components/charts/charts-shared";
import { STATUS_LABEL } from "@/lib/constants";
import type { StatusCount } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  submitted: "#64748B",
  under_review: "#B45309",
  in_progress: "#2563EB",
  resolved: "#15803D",
  rejected: "#B91C1C",
};

export default function StatusBarChart({ data, a11ySummary }: { data: StatusCount[]; a11ySummary: string }) {
  const rows = data.map((d) => ({ ...d, label: STATUS_LABEL[d.status] }));
  return (
    <ChartShell title="Reports by status" a11ySummary={a11ySummary} height={280}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: CHART.axis }} tickLine={false} axisLine={{ stroke: CHART.grid }} interval={0} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: CHART.axis }} tickLine={false} axisLine={false} width={34} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => [`${value} reports`, "Count"]} />
          <Bar dataKey="count" name="Reports" radius={[6, 6, 0, 0]} maxBarSize={56}>
            {rows.map((r) => (
              <Cell key={r.status} fill={STATUS_COLORS[r.status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
