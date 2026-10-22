"use client";

import { Activity, MessageSquare, UserRoundCheck } from "lucide-react";
import { useMemo } from "react";

import Card, { CardHeader } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { STATUS_LABEL } from "@/lib/constants";
import { useAppStore } from "@/lib/store";
import { formatRelative } from "@/lib/utils";
import Link from "next/link";

interface FeedEvent {
  key: string;
  at: string;
  reportId: string;
  text: string;
  kind: "status" | "assignment" | "comment";
}

/**
 * Activity feed derived from the mock dataset (status history + comments).
 * Clearly fictional: these are demo events, not real-time student activity.
 */
export default function ActivityFeed() {
  const { reports, staff } = useAppStore();

  const events = useMemo<FeedEvent[]>(() => {
    const all: FeedEvent[] = [];
    for (const r of reports) {
      for (const h of r.statusHistory) {
        all.push({
          key: `${r.id}-${h.status}-${h.at}`,
          at: h.at,
          reportId: r.id,
          kind: "status",
          text: `${h.by} marked ${r.id} as ${STATUS_LABEL[h.status].toLowerCase()}`,
        });
      }
      if (r.assignedTo) {
        const member = staff.find((s) => s.id === r.assignedTo);
        if (member) {
          all.push({
            key: `${r.id}-assign-${r.assignedTo}`,
            at: r.updatedAt,
            reportId: r.id,
            kind: "assignment",
            text: `${r.id} assigned to ${member.name}`,
          });
        }
      }
      for (const c of r.comments) {
        all.push({
          key: `${r.id}-${c.id}`,
          at: c.at,
          reportId: r.id,
          kind: "comment",
          text: `${c.author} commented on ${r.id}`,
        });
      }
    }
    return all.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 8);
  }, [reports, staff]);

  return (
    <Card>
      <CardHeader title="Recent activity" subtitle="Derived from the demo dataset, not live" />
      {events.length === 0 ? (
        <EmptyState icon={Activity} title="No activity yet" description="Demo activity will appear here." />
      ) : (
        <ol className="px-5 py-2">
          {events.map((e) => (
            <li key={e.key} className="flex gap-3 border-l border-line py-2.5 pl-4 -ml-px">
              <span aria-hidden className="mt-0.5 flex h-6 w-6 -ml-7 shrink-0 items-center justify-center rounded-full border border-line bg-card">
                {e.kind === "comment" ? (
                  <MessageSquare className="h-3 w-3 text-primary" />
                ) : e.kind === "assignment" ? (
                  <UserRoundCheck className="h-3 w-3 text-warning" />
                ) : (
                  <Activity className="h-3 w-3 text-muted" />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-sm leading-5 text-ink">
                  <Link href={`/reports/${e.reportId}`} className="hover:underline">
                    {e.text}
                  </Link>
                </p>
                <p className="mt-0.5 text-xs text-muted">{formatRelative(e.at)}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
