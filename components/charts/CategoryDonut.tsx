"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import ChartShell from "@/components/charts/ChartShell";
import { SEGMENT_COLORS, TOOLTIP_STYLE } from "@/components/charts/charts-shared";
import type { CategoryCount } from "@/types";

/**
 * Donut chart with an explicit text legend. The legend always names the
 * category and the count, so segments never rely on color alone.
 */
export default function CategoryDonut({ data, a11ySummary }: { data: CategoryCount[]; a11ySummary: string }) {
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <ChartShell title="Issues by category" subtitle="Share of reports in scope" a11ySummary={a11ySummary} height={290}>
      <div className="flex h-full flex-col sm:flex-row sm:items-center">
        <div className="h-44 sm:h-full sm:flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="category"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={2}
                stroke="#FFFFFF"
                strokeWidth={2}
              >
                {data.map((d, i) => (
                  <Cell key={d.category} fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number, name: string) => [`${value} reports`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex-1 space-y-1.5 px-3 pb-3 sm:py-4">
          {data.map((d, i) => (
            <li key={d.category} className="flex items-center gap-2 text-sm">
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
              />
              <span className="flex-1 text-ink">{d.category}</span>
              <span className="text-muted">
                {d.count} ({total > 0 ? Math.round((d.count / total) * 100) : 0}%)
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ChartShell>
  );
}
