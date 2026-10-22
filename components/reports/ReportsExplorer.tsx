"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import CategoryIcon from "@/components/reports/CategoryIcon";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import Button, { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { Input, Select } from "@/components/ui/Field";
import { CATEGORIES, PRIORITIES, PRIORITY_WEIGHT, STATUS_LABEL, STATUS_ORDER } from "@/lib/constants";
import { LOCATION_NAMES } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import { cx, formatDate, initialsOf, pluralize } from "@/lib/utils";
import type { ReportPriority, ReportStatus } from "@/types";

const PAGE_SIZE = 10;

type SortKey = "newest" | "oldest" | "priority";

const SORTERS: Record<SortKey, (a: import("@/types").Report, b: import("@/types").Report) => number> = {
  newest: (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  oldest: (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
  priority: (a, b) => {
    const w = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
    if (w !== 0) return w;
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
  },
};

export default function ReportsExplorer() {
  const searchParams = useSearchParams();
  const { role, visibleReports, staff } = useAppStore();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [status, setStatus] = useState<ReportStatus | "all">(
    (searchParams.get("status") as ReportStatus | null) ?? "all"
  );
  const [category, setCategory] = useState<string>("all");
  const [priority, setPriority] = useState<ReportPriority | "all">("all");
  const [location, setLocation] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const staffName = useMemo(() => new Map(staff.map((s) => [s.id, s.name])), [staff]);

  const hasFilters =
    query.trim() !== "" || status !== "all" || category !== "all" || priority !== "all" || location !== "all";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visibleReports.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (category !== "all" && r.category !== category) return false;
      if (priority !== "all" && r.priority !== priority) return false;
      if (location !== "all" && r.location !== location) return false;
      if (q) {
        const haystack = `${r.id} ${r.title} ${r.description}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [visibleReports, query, status, category, priority, location]);

  const sorted = useMemo(() => [...filtered].sort(SORTERS[sort]), [filtered, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const slice = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset to page 1 whenever the result set changes size upstream.
  useEffect(() => setPage(1), [query, status, category, priority, location, sort, role]);

  function clearFilters() {
    setQuery("");
    setStatus("all");
    setCategory("all");
    setPriority("all");
    setLocation("all");
  }

  const filterControls = (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label htmlFor="filter-status" className="mb-1.5 block text-xs font-medium text-muted">
          Status
        </label>
        <Select id="filter-status" value={status} onChange={(e) => setStatus(e.target.value as ReportStatus | "all")}>
          <option value="all">All statuses</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label htmlFor="filter-category" className="mb-1.5 block text-xs font-medium text-muted">
          Category
        </label>
        <Select id="filter-category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label htmlFor="filter-priority" className="mb-1.5 block text-xs font-medium text-muted">
          Priority
        </label>
        <Select
          id="filter-priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as ReportPriority | "all")}
        >
          <option value="all">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label htmlFor="filter-location" className="mb-1.5 block text-xs font-medium text-muted">
          Location
        </label>
        <Select id="filter-location" value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="all">All locations</option>
          {LOCATION_NAMES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-ink">Reports</h2>
          <p className="mt-1 text-sm text-muted">
            {filtered.length} {pluralize(filtered.length, "report")}
            {role === "student" ? " you submitted (demo scope)" : " in the campus demo dataset"}
          </p>
        </div>
        <Link href="/reports/new" className={buttonClasses("primary", "md")}>
          <Plus aria-hidden className="h-4 w-4" />
          Report an issue
        </Link>
      </div>

      {role === "student" ? (
        <p className="rounded-lg border border-line bg-card px-3 py-2 text-xs leading-5 text-muted">
          Students see only their own reports in this demo. Switch to the Staff or Administrator demo role to see the
          full campus queue.
        </p>
      ) : null}

      <Card className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <label htmlFor="report-search" className="sr-only">
                Search by title, description, or report ID
              </label>
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                id="report-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, description, or report ID"
                className="pl-9"
              />
            </div>
            <div>
              <label htmlFor="report-sort" className="sr-only">
                Sort reports
              </label>
              <Select id="report-sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="sm:w-44">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="priority">Highest priority</option>
              </Select>
            </div>
            <Button
              variant="secondary"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              className="lg:hidden"
            >
              <SlidersHorizontal aria-hidden className="h-4 w-4" />
              Filters
            </Button>
            {hasFilters ? (
              <Button variant="ghost" onClick={clearFilters}>
                <RotateCcw aria-hidden className="h-4 w-4" />
                Clear filters
              </Button>
            ) : null}
          </div>
          <div className={cx("lg:block", filtersOpen ? "block" : "hidden")}>{filterControls}</div>
        </div>
      </Card>

      {slice.length === 0 ? (
        <Card>
          {hasFilters ? (
            <EmptyState
              icon={Search}
              title="No reports match your filters"
              description="Try a different search term or clear the filters to see more reports."
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Clear all filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              title="No reports yet"
              description="When a report is submitted in this demo it will show up here and on the dashboard."
              action={
                <Link href="/reports/new" className={buttonClasses("primary", "md")}>
                  Report an issue
                </Link>
              }
            />
          )}
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="data-table w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-page text-xs uppercase tracking-wide text-muted">
                    <th scope="col" className="px-4 py-3 font-medium">Report</th>
                    <th scope="col" className="px-4 py-3 font-medium">Category</th>
                    <th scope="col" className="px-4 py-3 font-medium">Location</th>
                    <th scope="col" className="px-4 py-3 font-medium">Submitted</th>
                    <th scope="col" className="px-4 py-3 font-medium">Priority</th>
                    <th scope="col" className="px-4 py-3 font-medium">Status</th>
                    <th scope="col" className="px-4 py-3 font-medium">Assigned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {slice.map((r) => (
                    <tr key={r.id} className="transition-colors hover:bg-page/70">
                      <td className="max-w-[280px] px-4 py-3">
                        <Link href={`/reports/${r.id}`} className="block">
                          <span className="block truncate font-medium text-ink hover:underline">{r.title}</span>
                          <span className="block text-xs text-muted">{r.id}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2 text-muted">
                          <CategoryIcon category={r.category} className="h-7 w-7" iconClassName="h-3.5 w-3.5" />
                          {r.category}
                        </span>
                      </td>
                      <td className="max-w-[160px] truncate px-4 py-3 text-muted">{r.location}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(r.submittedAt)}</td>
                      <td className="px-4 py-3"><PriorityBadge priority={r.priority} /></td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3 text-muted">
                        {r.assignedTo && staffName.has(r.assignedTo) ? (
                          <span className="flex items-center gap-2">
                            <span aria-hidden className="flex h-6 w-6 items-center justify-center rounded-full bg-page text-[10px] font-semibold text-ink">
                              {initialsOf(staffName.get(r.assignedTo)!)}
                            </span>
                            <span className="max-w-[120px] truncate">{staffName.get(r.assignedTo)}</span>
                          </span>
                        ) : (
                          <span className="text-muted/70">Unassigned</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {slice.map((r) => (
              <li key={r.id}>
                <Link href={`/reports/${r.id}`}>
                  <Card className="p-4 transition-colors hover:border-slate-300">
                    <div className="flex items-start gap-3">
                      <CategoryIcon category={r.category} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-5 text-ink">{r.title}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          {r.id} · {r.location} · {formatDate(r.submittedAt)}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <StatusBadge status={r.status} />
                          <PriorityBadge priority={r.priority} />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p aria-live="polite" className="text-sm text-muted">
              Showing {slice.length} of {filtered.length} {pluralize(filtered.length, "report")}
            </p>
            {pageCount > 1 ? (
              <nav aria-label="Report pages" className="flex items-center gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft aria-hidden className="h-4 w-4" />
                </Button>
                {Array.from({ length: pageCount }, (_, i) => i + 1)
                  .filter((n) => Math.abs(n - safePage) <= 2 || n === 1 || n === pageCount)
                  .reduce<(number | "gap")[]>((acc, n, i, arr) => {
                    if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push("gap");
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((n, i) =>
                    n === "gap" ? (
                      <span key={`gap-${i}`} className="px-1 text-muted" aria-hidden>
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPage(n)}
                        aria-current={safePage === n ? "page" : undefined}
                        aria-label={`Page ${n}`}
                        className={cx(
                          "h-9 w-9 rounded-lg border text-sm font-medium transition-colors",
                          safePage === n ? "border-primary bg-primary text-white" : "border-line bg-card text-ink hover:bg-page"
                        )}
                      >
                        {n}
                      </button>
                    )
                  )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={safePage >= pageCount}
                  aria-label="Next page"
                >
                  <ChevronRight aria-hidden className="h-4 w-4" />
                </Button>
              </nav>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
