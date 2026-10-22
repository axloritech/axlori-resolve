"use client";

import Link from "next/link";
import { CheckCircle2, ClipboardList, Loader, Plus, Timer } from "lucide-react";
import { useMemo } from "react";

import CategoryDonut from "@/components/charts/CategoryDonut";
import ReportsTrendChart from "@/components/charts/ReportsTrendChart";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import PriorityIssuesPanel from "@/components/dashboard/PriorityIssuesPanel";
import RecentReportsTable from "@/components/dashboard/RecentReportsTable";
import StatCard from "@/components/dashboard/StatCard";
import DemoNote from "@/components/ui/DemoNote";
import { buttonClasses } from "@/components/ui/Button";
import { countByCategory, formatDays, overviewStats, weeklyBuckets } from "@/lib/stats";
import { useAppStore } from "@/lib/store";
import { firstNameOf, greetingForDemoTime } from "@/lib/utils";

export default function DashboardPage() {
  const { currentUser, reports } = useAppStore();

  // Dashboard KPIs and charts are computed from the full campus demo dataset.
  const stats = useMemo(() => overviewStats(reports), [reports]);
  const trend = useMemo(() => weeklyBuckets(reports, 12), [reports]);
  const categories = useMemo(() => countByCategory(reports), [reports]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            {greetingForDemoTime()}, {firstNameOf(currentUser.name)}
          </h2>
          <p className="mt-1 text-sm text-muted">Here&rsquo;s what&rsquo;s happening across your campus.</p>
        </div>
        <Link href="/reports/new" className={buttonClasses("primary", "lg")}>
          <Plus aria-hidden className="h-5 w-5" />
          Report an issue
        </Link>
      </div>

      <DemoNote>
        This dashboard is populated with fictional demonstration data (demo dataset snapshot: 22 Oct 2026). Nothing here
        reflects a real campus or real users.
      </DemoNote>

      <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open reports"
          value={String(stats.openCount)}
          note="Submitted or under review, computed from demo data"
          Icon={ClipboardList}
          href="/reports"
        />
        <StatCard
          label="In progress"
          value={String(stats.inProgressCount)}
          note="Assigned and being worked on"
          Icon={Loader}
          href="/reports?status=in_progress"
        />
        <StatCard
          label="Resolved this month"
          value={String(stats.resolvedThisMonth)}
          note="Demo resolutions in October 2026"
          Icon={CheckCircle2}
          href="/reports?status=resolved"
        />
        <StatCard
          label="Avg. resolution"
          value={formatDays(stats.avgResolutionDays)}
          note="Mean submission-to-resolution in the demo set"
          Icon={Timer}
          href="/analytics"
        />
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ReportsTrendChart
            data={trend}
            subtitle="Submitted vs resolved reports per week, last 12 weeks (demo)"
            a11ySummary="Line chart of weekly submitted and resolved report counts from the demo dataset."
          />
        </div>
        <CategoryDonut
          data={categories}
          a11ySummary="Donut chart showing the breakdown of demo reports by category."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentReportsTable />
        </div>
        <div className="space-y-4">
          <PriorityIssuesPanel />
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
