"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";

import Card, { CardHeader } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";
import { formatRelative } from "@/lib/utils";

export default function RecentReportsTable() {
  const { role, visibleReports } = useAppStore();
  const isStudent = role === "student";

  const recent = useMemo(
    () =>
      [...visibleReports]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 6),
    [visibleReports]
  );

  return (
    <Card>
      <CardHeader
        title={isStudent ? "Your recent reports" : "Recent reports"}
        subtitle={isStudent ? "Reports you have submitted in this demo" : "Latest updates across the campus demo dataset"}
        action={
          <Link href="/reports" className={buttonClasses("secondary", "sm")}>
            View all
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        }
      />
      {recent.length === 0 ? (
        <EmptyState
          title="No reports yet"
          description="Reports you submit in this demo will appear here."
          action={
            <Link href="/reports/new" className={buttonClasses("primary", "sm")}>
              Report an issue
            </Link>
          }
        />
      ) : (
        <ul className="divide-y divide-line">
          {recent.map((r) => (
            <li key={r.id}>
              <Link href={`/reports/${r.id}`} className="block px-5 py-4 transition-colors hover:bg-page">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{r.title}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {r.id} · {r.location} · updated {formatRelative(r.updatedAt)}
                    </p>
                  </div>
                  <PriorityBadge priority={r.priority} />
                  <StatusBadge status={r.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
