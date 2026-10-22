"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartShell from "@/components/charts/ChartShell";
import { CHART, TOOLTIP_STYLE } from "@/components/charts/charts-shared";
import type { TimeBucket } from "@/types";

interface Props {
  data: TimeBucket[];
  title?: string;
  subtitle?: string;
  height?: number;
  a11ySummary: string;
}

export default function ReportsTrendChart({ data, title = "Reports over time", subtitle, height, a11ySummary }: Props) {
  return (
    <ChartShell title={title} subtitle={subtitle} a11ySummary={a11ySummary} height={height ?? 290}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: CHART.axis }} tickLine={false} axisLine={{ stroke: CHART.grid }} />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: CHART.axis }}
            tickLine={false}
            axisLine={false}
            width={34}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ fontWeight: 600 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="submitted"
            name="Submitted"
            stroke={CHART.submitted}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="resolved"
            name="Resolved"
            stroke={CHART.resolved}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
