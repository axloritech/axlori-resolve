"use client";

import { BarChart3, CheckCircle2, ClipboardList, Timer } from "lucide-react";
import { useMemo, useState } from "react";

import CategoryDonut from "@/components/charts/CategoryDonut";
import LocationBarChart from "@/components/charts/LocationBarChart";
import ReportsTrendChart from "@/components/charts/ReportsTrendChart";
import StatusBarChart from "@/components/charts/StatusBarChart";
import RoleGate from "@/components/layout/RoleGate";
import StatCard from "@/components/dashboard/StatCard";
import Card from "@/components/ui/Card";
import DemoNote from "@/components/ui/DemoNote";
import { Select } from "@/components/ui/Field";
import { DEMO_NOW } from "@/lib/constants";
import {
  avgResolutionDays,
  countByCategory,
  countByLocation,
  countByStatus,
  formatDays,
  monthlyBuckets,
  reportsInRange,
  resolutionRate,
  weeklyBuckets,
} from "@/lib/stats";
import { useAppStore } from "@/lib/store";

type RangeKey = "30" | "60" | "90" | "all";

const RANGES: Array<{ key: RangeKey; label: string; days: number | null }> = [
  { key: "30", label: "Last 30 days", days: 30 },
  { key: "60", label: "Last 60 days", days: 60 },
  { key: "90", label: "Last 90 days", days: 90 },
  { key: "all", label: "All demo data", days: null },
];

const DAY = 86400000;

export default function AnalyticsPage() {
  return (
    <RoleGate allow={["staff", "admin"]} feature="Analytics">
      <AnalyticsContent />
    </RoleGate>
  );
}

function AnalyticsContent() {
  const { reports } = useAppStore();
  const [rangeKey, setRangeKey] = useState<RangeKey>("90");

  const range = RANGES.find((r) => r.key === rangeKey) ?? RANGES[2];
  const fromMs = range.days === null ? null : DEMO_NOW.getTime() - range.days * DAY;

  const scoped = useMemo(
    () => reportsInRange(reports, fromMs, DEMO_NOW.getTime()),
    [reports, fromMs]
  );

  const rate = useMemo(() => resolutionRate(scoped), [scoped]);
  const avgDays = useMemo(() => avgResolutionDays(scoped), [scoped]);
  const byCategory = useMemo(() => countByCategory(scoped), [scoped]);
  const byStatus = useMemo(() => countByStatus(scoped), [scoped]);
  const byLocation = useMemo(() => countByLocation(scoped, false), [scoped]);
  const trend = useMemo(() => {
    if (range.days !== null && range.days <= 60) {
      return { weekly: true, data: weeklyBuckets(reports, range.days === 30 ? 6 : 10) };
    }
    const from = fromMs ?? Math.min(...reports.map((r) => new Date(r.submittedAt).getTime()));
    return { weekly: false, data: monthlyBuckets(reports, from, DEMO_NOW.getTime()) };
  }, [reports, range, fromMs]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-ink">Analytics</h2>
          <p className="mt-1 text-sm text-muted">Trends computed live from the fictional demo dataset.</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="range" className="text-sm text-muted">
            Date range
          </label>
          <Select id="range" value={rangeKey} onChange={(e) => setRangeKey(e.target.value as RangeKey)} className="w-44">
            {RANGES.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <DemoNote>
        All figures are calculated from invented demo reports (snapshot 22 Oct 2026) and demonstrate interface
        behaviour only. They are not performance claims about any real campus or team.
      </DemoNote>

      <section aria-label="Analytics key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total reports"
          value={String(scoped.length)}
          note={`Submitted ${range.label.toLowerCase()}`}
          Icon={ClipboardList}
        />
        <StatCard
          label="Resolution rate"
          value={rate.pct === null ? "--" : `${rate.pct.toFixed(0)}%`}
          note={rate.closed > 0 ? `${rate.resolved} of ${rate.closed} closed reports resolved` : "No closed reports in range"}
          Icon={CheckCircle2}
        />
        <StatCard
          label="Avg. resolution time"
          value={formatDays(avgDays)}
          note="Mean across reports resolved in scope"
          Icon={Timer}
        />
        <StatCard
          label="Active now"
          value={String(byStatus.filter((s) => ["submitted", "under_review", "in_progress"].includes(s.status)).reduce((n, s) => n + s.count, 0))}
          note="Open or in progress within range"
          Icon={BarChart3}
        />
      </section>

      <ReportsTrendChart
        data={trend.data}
        title="Reporting trend"
        subtitle={trend.weekly ? "Weekly submitted vs resolved (demo)" : "Monthly submitted vs resolved (demo)"}
        height={300}
        a11ySummary={`Chart of submitted and resolved reports over time for ${range.label.toLowerCase()}, computed from demo data.`}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <StatusBarChart data={byStatus} a11ySummary="Bar chart of report counts by status in the selected demo range." />
        <CategoryDonut data={byCategory} a11ySummary="Donut chart of report counts by category in the selected demo range." />
      </div>

      <LocationBarChart
        data={byLocation}
        limit={8}
        a11ySummary="Horizontal bar chart of the most frequently reported demo locations in range."
      />

      {scoped.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted">
          No demo reports fall inside the selected range. Widen the date range to repopulate the charts.
        </Card>
      ) : null}
    </div>
  );
}
