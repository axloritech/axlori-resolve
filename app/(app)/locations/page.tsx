"use client";

import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";

import Card, { CardHeader } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Field";
import { LOCATIONS } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import { cx, pluralize } from "@/lib/utils";
import type { CampusLocation, ReportCategory } from "@/types";

interface LocationSummary {
  location: CampusLocation;
  openCount: number;
  categories: Array<{ category: ReportCategory; count: number }>;
  recentOpen: Array<{ id: string; title: string; status: import("@/types").ReportStatus }>;
}

export default function LocationsPage() {
  const { reports } = useAppStore();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(LOCATIONS[0].id);

  const summaries = useMemo<LocationSummary[]>(() => {
    return LOCATIONS.map((location) => {
      const open = reports.filter(
        (r) => r.location === location.name && r.status !== "resolved" && r.status !== "rejected"
      );
      const byCat = new Map<ReportCategory, number>();
      for (const r of open) byCat.set(r.category, (byCat.get(r.category) ?? 0) + 1);
      const categories = Array.from(byCat.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
      const recentOpen = [...open]
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(0, 5)
        .map((r) => ({ id: r.id, title: r.title, status: r.status }));
      return { location, openCount: open.length, categories, recentOpen };
    });
  }, [reports]);

  const filtered = summaries.filter((s) => s.location.name.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = summaries.find((s) => s.location.id === selectedId) ?? null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-ink">Map &amp; Locations</h2>
        <p className="mt-1 text-sm text-muted">
          Browse open reports by campus location. Counts are computed from the demo dataset.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-2">
          <CardHeader title="Campus locations" subtitle={`${LOCATIONS.length} locations in the fictional demo campus`} />
          <div className="px-5 pb-2 pt-3">
            <label htmlFor="location-search" className="sr-only">
              Search locations
            </label>
            <div className="relative">
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                id="location-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search buildings and locations"
                className="pl-9"
              />
            </div>
          </div>
          {filtered.length === 0 ? (
            <EmptyState icon={Search} title="No locations found" description="Try a different search term." />
          ) : (
            <ul className="divide-y divide-line">
              {filtered.map((s) => (
                <li key={s.location.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(s.location.id)}
                    aria-pressed={selectedId === s.location.id}
                    className={cx(
                      "w-full px-5 py-3.5 text-left transition-colors hover:bg-page",
                      selectedId === s.location.id && "bg-primary-subtle/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-page">
                        <MapPin className="h-4 w-4 text-primary" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{s.location.name}</p>
                        <p className="mt-0.5 text-xs text-muted">{s.location.kind}</p>
                      </div>
                      <span
                        className={cx(
                          "rounded-full border px-2 py-0.5 text-xs font-medium",
                          s.openCount > 0 ? "border-primary-border bg-primary-subtle text-navy-800" : "border-line bg-page text-muted"
                        )}
                      >
                        {s.openCount} open
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-4 xl:col-span-3">
          <Card>
            <CardHeader
              title="Campus map"
              subtitle="Illustrative layout only: fictional campus, not to scale, no map provider configured"
            />
            <div className="px-5 py-4">
              <div className="relative overflow-hidden rounded-xl border border-line bg-[#EDF3EB]">
                {/* Decorative illustrative backdrop: paths and green areas. */}
                <svg aria-hidden viewBox="0 0 100 80" className="block h-auto w-full" preserveAspectRatio="none">
                  <path d="M0 30 C 25 28, 45 34, 100 26" fill="none" stroke="#CBD5E1" strokeWidth="3.5" />
                  <path d="M0 58 C 30 62, 70 52, 100 60" fill="none" stroke="#CBD5E1" strokeWidth="3.5" />
                  <path d="M30 0 C 34 25, 28 55, 36 80" fill="none" stroke="#CBD5E1" strokeWidth="3" />
                  <path d="M66 0 C 62 25, 70 50, 64 80" fill="none" stroke="#CBD5E1" strokeWidth="3" />
                  <circle cx="47" cy="15" r="9" fill="#DCF0DC" />
                  <circle cx="14" cy="72" r="8" fill="#DCF0DC" />
                </svg>
                {summaries.map((s) => (
                  <button
                    key={s.location.id}
                    type="button"
                    onClick={() => setSelectedId(s.location.id)}
                    aria-label={`${s.location.name}: ${s.openCount} open ${pluralize(s.openCount, "report")}`}
                    aria-pressed={selectedId === s.location.id}
                    className="group absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${s.location.mapX}%`, top: `${s.location.mapY}%` }}
                  >
                    <span
                      className={cx(
                        "flex min-w-7 items-center justify-center gap-1 rounded-lg border px-1.5 py-1 text-xs font-semibold shadow-card transition-colors",
                        selectedId === s.location.id
                          ? "border-primary bg-primary text-white"
                          : "border-line bg-card text-ink group-hover:border-primary"
                      )}
                    >
                      <MapPin aria-hidden className="h-3 w-3" />
                      {s.openCount}
                    </span>
                    <span className="mt-1 block max-w-[110px] truncate rounded bg-card/90 px-1 text-[10px] font-medium text-ink shadow-sm">
                      {s.location.name}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs leading-5 text-muted">
                Pins show open report counts per location. This is a static illustration, not an interactive map
                service.
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader
              title={selected ? selected.location.name : "Location details"}
              subtitle={selected ? `${selected.location.kind} · ${selected.openCount} open ${pluralize(selected.openCount, "report")}` : undefined}
            />
            {selected ? (
              <div className="space-y-5 px-5 py-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Open reports by category</h3>
                  {selected.categories.length === 0 ? (
                    <p className="mt-2 text-sm text-muted">No open reports at this location in the demo dataset.</p>
                  ) : (
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {selected.categories.map((c) => (
                        <li
                          key={c.category}
                          className="rounded-full border border-line bg-page px-2.5 py-1 text-xs font-medium text-ink"
                        >
                          {c.category}: {c.count}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Most recent open reports</h3>
                  {selected.recentOpen.length === 0 ? (
                    <p className="mt-2 text-sm text-muted">Nothing waiting on action here.</p>
                  ) : (
                    <ul className="mt-2 divide-y divide-line rounded-lg border border-line">
                      {selected.recentOpen.map((r) => (
                        <li key={r.id}>
                          <Link
                            href={`/reports/${r.id}`}
                            className="flex items-center justify-between gap-3 px-3.5 py-2.5 transition-colors hover:bg-page"
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-ink">{r.title}</span>
                              <span className="text-xs text-muted">{r.id}</span>
                            </span>
                            <StatusBadge status={r.status} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState title="Select a location" description="Pick a building in the list or on the map to see details." />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
