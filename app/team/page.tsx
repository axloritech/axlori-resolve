"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import RoleGate from "@/components/layout/RoleGate";
import Card, { CardHeader } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Field";
import DemoNote from "@/components/ui/DemoNote";
import { useAppStore } from "@/lib/store";
import { cx, initialsOf, pluralize } from "@/lib/utils";
import type { StaffMember } from "@/types";

const DEPARTMENTS = ["Facilities", "ICT", "Security", "Estates", "Welfare"] as const;

export default function TeamPage() {
  return (
    <RoleGate allow={["staff", "admin"]} feature="Team">
      <TeamContent />
    </RoleGate>
  );
}

function TeamContent() {
  const { staff, reports } = useAppStore();
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState<string>("all");
  const [selected, setSelected] = useState<StaffMember | null>(null);

  const activeByStaff = useMemo(() => {
    const map = new Map<string, typeof reports>();
    for (const s of staff) map.set(s.id, []);
    for (const r of reports) {
      if (r.assignedTo && (r.status === "submitted" || r.status === "under_review" || r.status === "in_progress")) {
        const list = map.get(r.assignedTo);
        if (list) list.push(r);
        else map.set(r.assignedTo, [r]);
      }
    }
    return map;
  }, [staff, reports]);

  const filtered = staff.filter((s) => {
    if (department !== "all" && s.department !== department) return false;
    const q = query.trim().toLowerCase();
    if (q && !`${s.name} ${s.role} ${s.department}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const selectedActive = selected ? (activeByStaff.get(selected.id) ?? []) : [];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-ink">Team</h2>
        <p className="mt-1 text-sm text-muted">
          Fictional staff directory with workloads computed from demo assignments.
        </p>
      </div>

      <DemoNote>
        People listed here are invented demo personas. Invitations, account provisioning and permissions are not part
        of this frontend phase.
      </DemoNote>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <label htmlFor="team-search" className="sr-only">
              Search staff by name, role, or department
            </label>
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              id="team-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search staff"
              className="pl-9"
            />
          </div>
          <div className="sm:w-56">
            <label htmlFor="team-dept" className="sr-only">
              Filter by department
            </label>
            <Select id="team-dept" value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="all">All departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={Search} title="No staff match" description="Adjust the search or department filter." />
        </Card>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filtered.map((s) => {
            const active = activeByStaff.get(s.id) ?? [];
            const load = Math.min(100, Math.round((active.length / s.capacity) * 100));
            return (
              <li key={s.id}>
                <Card className="h-full p-5">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: s.avatarColor }}
                    >
                      {initialsOf(s.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{s.name}</p>
                      <p className="truncate text-xs text-muted">{s.role}</p>
                      <p className="mt-1 inline-flex rounded-full border border-line bg-page px-2 py-0.5 text-xs text-muted">
                        {s.department}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted">Active workload</span>
                      <span className="font-medium text-ink">
                        {active.length} of {s.capacity} slots
                      </span>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuenow={load}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${s.name} workload ${load} percent`}
                      className="mt-1.5 h-2 overflow-hidden rounded-full bg-page"
                    >
                      <div
                        className={cx("h-full rounded-full", load >= 90 ? "bg-danger" : load >= 65 ? "bg-warning" : "bg-primary")}
                        style={{ width: `${load}%` }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(s)}
                    className="mt-4 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-page"
                  >
                    View profile
                  </button>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name ?? "Staff profile"}
        description={selected ? `${selected.role}, ${selected.department}` : undefined}
      >
        {selected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold text-white"
                style={{ backgroundColor: selected.avatarColor }}
              >
                {initialsOf(selected.name)}
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{selected.name}</p>
                <p className="text-xs text-muted">{selected.email}</p>
              </div>
            </div>
            <p className="text-sm text-muted">
              {selectedActive.length} active assigned {pluralize(selectedActive.length, "report")} in the demo queue.
            </p>
            {selectedActive.length === 0 ? (
              <p className="rounded-lg border border-line bg-page px-3 py-2.5 text-sm text-muted">
                No active assignments right now.
              </p>
            ) : (
              <ul className="divide-y divide-line rounded-lg border border-line">
                {selectedActive.slice(0, 6).map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/reports/${r.id}`}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 transition-colors hover:bg-page"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink">{r.title}</span>
                        <span className="text-xs text-muted">
                          {r.id} · {r.location}
                        </span>
                      </span>
                      <StatusBadge status={r.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs leading-5 text-muted">
              Assignment is simulated. You can reassign reports from the report detail page while using a staff demo
              role.
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
