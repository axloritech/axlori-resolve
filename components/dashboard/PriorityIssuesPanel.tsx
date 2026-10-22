"use client";

import Link from "next/link";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { useMemo } from "react";

import Card, { CardHeader } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { PriorityBadge } from "@/components/ui/Badge";
import { PRIORITY_WEIGHT, STATUS_LABEL } from "@/lib/constants";
import { useAppStore } from "@/lib/store";

/**
 * Staff and administrators see the highest-priority open campus reports.
 * Students instead see a compact list of their own unresolved reports.
 */
export default function PriorityIssuesPanel() {
  const { role, reports, visibleReports } = useAppStore();
  const isStudent = role === "student";

  const items = useMemo(() => {
    if (isStudent) {
      return [...visibleReports]
        .filter((r) => r.status !== "resolved" && r.status !== "rejected")
        .sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority])
        .slice(0, 5);
    }
    return [...reports]
      .filter((r) => r.status !== "resolved" && r.status !== "rejected")
      .filter((r) => r.priority === "High" || r.priority === "Urgent")
      .sort((a, b) => {
        const w = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
        if (w !== 0) return w;
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      })
      .slice(0, 5);
  }, [isStudent, reports, visibleReports]);

  return (
    <Card>
      <CardHeader
        title={isStudent ? "Your active reports" : "Priority issues"}
        subtitle={isStudent ? "Your reports still awaiting resolution" : "Open High and Urgent reports, oldest first"}
      />
      {items.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="Nothing urgent right now"
          description="No high-priority open reports in the demo dataset."
        />
      ) : (
        <ul className="divide-y divide-line">
          {items.map((r) => (
            <li key={r.id}>
              <Link href={`/reports/${r.id}`} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-page">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{r.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {r.id} · {r.location} · {STATUS_LABEL[r.status]}
                  </p>
                </div>
                <PriorityBadge priority={r.priority} />
                <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
