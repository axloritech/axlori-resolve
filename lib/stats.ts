/**
 * Statistics computed from the (mock) report dataset.
 *
 * Every number shown on the dashboard and analytics pages comes from these
 * pure functions, so charts and KPIs always agree with each other and with
 * the underlying mock data.
 */

import { CATEGORIES, DEMO_NOW, STATUS_ORDER } from "@/lib/constants";
import type {
  CategoryCount,
  LocationCount,
  OverviewStats,
  Report,
  StatusCount,
  TimeBucket,
} from "@/types";

const DAY = 86400000;

function resolvedAt(r: Report): number | null {
  for (let i = r.statusHistory.length - 1; i >= 0; i--) {
    if (r.statusHistory[i].status === "resolved") return new Date(r.statusHistory[i].at).getTime();
  }
  return null;
}

export function reportsInRange(reports: Report[], fromMs: number | null, toMs: number): Report[] {
  return reports.filter((r) => {
    const t = new Date(r.submittedAt).getTime();
    if (fromMs !== null && t < fromMs) return false;
    return t <= toMs;
  });
}

export function overviewStats(reports: Report[]): OverviewStats {
  const now = DEMO_NOW.getTime();
  const monthStart = Date.UTC(DEMO_NOW.getUTCFullYear(), DEMO_NOW.getUTCMonth(), 1);

  let open = 0;
  let inProgress = 0;
  let resolvedThisMonth = 0;
  let durationSumMs = 0;
  let durationCount = 0;

  for (const r of reports) {
    if (r.status === "submitted" || r.status === "under_review") open += 1;
    if (r.status === "in_progress") inProgress += 1;
    const res = resolvedAt(r);
    if (res !== null && res >= monthStart && res <= now) {
      resolvedThisMonth += 1;
      durationSumMs += res - new Date(r.submittedAt).getTime();
      durationCount += 1;
    }
  }

  return {
    openCount: open,
    inProgressCount: inProgress,
    resolvedThisMonth,
    avgResolutionDays: durationCount > 0 ? durationSumMs / durationCount / DAY : null,
  };
}

/** Resolution rate for a set of reports that are no longer active or were submitted in-range. */
export function resolutionRate(reports: Report[]): { resolved: number; closed: number; pct: number | null } {
  let resolved = 0;
  let closed = 0;
  for (const r of reports) {
    if (r.status === "resolved") {
      resolved += 1;
      closed += 1;
    } else if (r.status === "rejected") {
      closed += 1;
    }
  }
  return { resolved, closed, pct: closed > 0 ? (resolved / closed) * 100 : null };
}

export function avgResolutionDays(reports: Report[]): number | null {
  let sumMs = 0;
  let count = 0;
  for (const r of reports) {
    const res = resolvedAt(r);
    if (res !== null) {
      sumMs += res - new Date(r.submittedAt).getTime();
      count += 1;
    }
  }
  return count > 0 ? sumMs / count / DAY : null;
}

export function countByCategory(reports: Report[]): CategoryCount[] {
  const map = new Map<string, number>();
  for (const r of reports) map.set(r.category, (map.get(r.category) ?? 0) + 1);
  return CATEGORIES.filter((c) => map.has(c)).map((category) => ({
    category,
    count: map.get(category) ?? 0,
  }));
}

export function countByStatus(reports: Report[]): StatusCount[] {
  const map = new Map<string, number>();
  for (const r of reports) map.set(r.status, (map.get(r.status) ?? 0) + 1);
  return STATUS_ORDER.filter((s) => map.has(s)).map((status) => ({
    status,
    count: map.get(status) ?? 0,
  }));
}

export function countByLocation(reports: Report[], activeOnly: boolean): LocationCount[] {
  const map = new Map<string, number>();
  for (const r of reports) {
    if (activeOnly && (r.status === "resolved" || r.status === "rejected")) continue;
    map.set(r.location, (map.get(r.location) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Weekly buckets (Mon-Sun) ending at the demo anchor. Default spans 12 weeks.
 */
export function weeklyBuckets(reports: Report[], weeks: number): TimeBucket[] {
  const anchor = new Date(DEMO_NOW);
  // Move to Monday of the anchor week (UTC).
  const dow = (anchor.getUTCDay() + 6) % 7; // Mon = 0
  const mondayThisWeek = Date.UTC(
    anchor.getUTCFullYear(),
    anchor.getUTCMonth(),
    anchor.getUTCDate() - dow
  );

  const buckets: Array<{ start: number; end: number; label: string; submitted: number; resolved: number }> = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = mondayThisWeek - i * 7 * DAY;
    const end = start + 7 * DAY;
    const d = new Date(start);
    const label = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
    buckets.push({ start, end, label, submitted: 0, resolved: 0 });
  }

  for (const r of reports) {
    const s = new Date(r.submittedAt).getTime();
    for (const b of buckets) {
      if (s >= b.start && s < b.end) {
        b.submitted += 1;
        break;
      }
    }
    const res = resolvedAt(r);
    if (res !== null) {
      for (const b of buckets) {
        if (res >= b.start && res < b.end) {
          b.resolved += 1;
          break;
        }
      }
    }
  }

  return buckets.map(({ label, submitted, resolved }) => ({ label, submitted, resolved }));
}

/** Monthly aggregates across a range (used by the analytics trends chart). */
export function monthlyBuckets(reports: Report[], fromMs: number, toMs: number): TimeBucket[] {
  const startDate = new Date(fromMs);
  const monthCursor = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1);
  const buckets: Array<{ start: number; end: number; label: string; submitted: number; resolved: number }> = [];

  let cursor = monthCursor;
  while (cursor <= toMs) {
    const d = new Date(cursor);
    const next = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
    buckets.push({
      start: cursor,
      end: next,
      label: d.toLocaleDateString("en-GB", { month: "short", year: "2-digit", timeZone: "UTC" }),
      submitted: 0,
      resolved: 0,
    });
    cursor = next;
  }

  for (const r of reports) {
    const s = new Date(r.submittedAt).getTime();
    const res = resolvedAt(r);
    for (const b of buckets) {
      if (s >= b.start && s < b.end) b.submitted += 1;
      if (res !== null && res >= b.start && res < b.end) b.resolved += 1;
    }
  }
  return buckets.map(({ label, submitted, resolved }) => ({ label, submitted, resolved }));
}

export function formatDays(days: number | null): string {
  if (days === null) return "--";
  return `${days.toFixed(1)} ${Math.abs(days - 1) < 0.05 ? "day" : "days"}`;
}
