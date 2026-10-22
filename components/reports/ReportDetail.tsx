"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  FileQuestion,
  MapPin,
  MessageSquare,
  Send,
  UserRoundCheck,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import CategoryIcon from "@/components/reports/CategoryIcon";
import StatusTimeline from "@/components/reports/StatusTimeline";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import Button, { buttonClasses } from "@/components/ui/Button";
import Card, { CardHeader } from "@/components/ui/Card";
import DemoNote from "@/components/ui/DemoNote";
import { Select, Textarea } from "@/components/ui/Field";
import { ROLE_LABEL, STATUS_LABEL, STATUS_ORDER } from "@/lib/constants";
import { useAppStore } from "@/lib/store";
import { formatDate, formatDateTime, formatRelative, initialsOf } from "@/lib/utils";
import type { ReportStatus } from "@/types";

/** Full report detail view, including timeline, comments and role actions. */
export default function ReportDetail({ reportId }: { reportId: string }) {
  const { getReport, role, staff, currentUser, addComment, updateStatus, assignReport, pushToast } = useAppStore();
  const report = getReport(reportId);

  const staffName = useMemo(() => new Map(staff.map((s) => [s.id, s])), [staff]);

  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<ReportStatus | "">("");
  const [pendingAssignee, setPendingAssignee] = useState<string>(" ");

  useEffect(() => {
    setPendingStatus("");
    setPendingAssignee(report?.assignedTo ?? " ");
    setComment("");
    setCommentError(null);
  }, [reportId, report?.assignedTo]);

  if (!report) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <span aria-hidden className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-page">
          <FileQuestion className="h-6 w-6 text-muted" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-ink">Report not found</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          No report with ID <span className="font-medium text-ink">{reportId}</span> exists in the demo dataset.
        </p>
        <Link href="/reports" className={buttonClasses("primary", "md") + " mt-5 inline-flex"}>
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Back to reports
        </Link>
      </Card>
    );
  }

  const canManage = role === "staff" || role === "admin";
  const assignee = report.assignedTo ? staffName.get(report.assignedTo) : undefined;
  const otherStatuses = STATUS_ORDER.filter((s) => s !== report.status);

  function submitComment(e: FormEvent) {
    e.preventDefault();
    const body = comment.trim();
    if (body.length < 3) {
      setCommentError("Write at least 3 characters.");
      return;
    }
    addComment(report!.id, body);
    setComment("");
    setCommentError(null);
    pushToast("success", "Comment added. It is stored in local demo state only.");
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/reports" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover">
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Back to reports
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">{report.id}</p>
            <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-ink sm:text-2xl">{report.title}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={report.priority} />
            <StatusBadge status={report.status} />
          </div>
        </div>
      </div>

      <DemoNote>
        Everything on this page is part of the frontend demo. Status changes, assignments and comments are simulated in
        local browser state and are never sent to staff.
      </DemoNote>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card>
            <CardHeader title="Description" />
            <div className="space-y-4 px-5 py-4">
              <p className="text-sm leading-6 text-ink">{report.description}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                <span className="flex items-center gap-1.5">
                  <CategoryIcon category={report.category} className="h-6 w-6" iconClassName="h-3 w-3" />
                  {report.category}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin aria-hidden className="h-4 w-4" />
                  {report.location}
                  {report.building ? `, ${report.building}` : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays aria-hidden className="h-4 w-4" />
                  Submitted {formatDateTime(report.submittedAt)}
                </span>
              </div>
              {report.imageUrl ? (
                <figure>
                  {/* eslint-disable-next-line @next/next/no-img-element -- locally stored demo image */}
                  <img
                    src={report.imageUrl}
                    alt={
                      report.imageIsDemoPlaceholder
                        ? `Placeholder graphic standing in for a photo of: ${report.title}`
                        : `Photo attached to report ${report.id}`
                    }
                    className="max-h-72 w-auto rounded-lg border border-line object-contain"
                  />
                  <figcaption className="mt-1.5 text-xs text-muted">
                    {report.imageIsDemoPlaceholder
                      ? "Labelled placeholder graphic, not a real incident photograph."
                      : "Attached by the reporter and stored locally in this demo."}
                  </figcaption>
                </figure>
              ) : null}
            </div>
          </Card>

          <Card>
            <CardHeader title="Status history" subtitle="Every state change recorded for this demo report" />
            <div className="px-5 py-5">
              <StatusTimeline history={report.statusHistory} />
            </div>
          </Card>

          <Card>
            <CardHeader
              title={`Comments (${report.comments.length})`}
              subtitle="Simulated conversation stored in local demo state"
            />
            <div className="space-y-4 px-5 py-4">
              {report.comments.length === 0 ? (
                <p className="text-sm text-muted">No comments yet. Start the conversation below.</p>
              ) : (
                <ul className="space-y-4">
                  {report.comments.map((c) => (
                    <li key={c.id} className="flex gap-3">
                      <span
                        aria-hidden
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-page text-xs font-semibold text-ink"
                      >
                        {initialsOf(c.author)}
                      </span>
                      <div className="min-w-0 flex-1 rounded-lg border border-line bg-page/60 px-3.5 py-2.5">
                        <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
                          <span className="font-semibold text-ink">{c.author}</span>
                          <span className="rounded-full border border-line bg-card px-1.5 py-0.5">{ROLE_LABEL[c.authorRole]}</span>
                          <span>{formatRelative(c.at)}</span>
                        </p>
                        <p className="mt-1 text-sm leading-6 text-ink">{c.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <form onSubmit={submitComment} className="space-y-2 border-t border-line pt-4">
                <label htmlFor="comment" className="block text-sm font-medium text-ink">
                  Add a comment as {currentUser.name}
                </label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ask a question or add more detail. Stored locally in this demo."
                  className="min-h-[90px]"
                  aria-invalid={!!commentError}
                  aria-describedby={commentError ? "comment-error" : undefined}
                />
                {commentError ? (
                  <p id="comment-error" role="alert" className="text-xs font-medium text-danger">
                    {commentError}
                  </p>
                ) : null}
                <div className="flex justify-end">
                  <Button type="submit" size="sm">
                    <Send aria-hidden className="h-4 w-4" />
                    Post comment
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Details" />
            <dl className="space-y-3 px-5 py-4 text-sm">
              <Row label="Reporter" value={`${report.submittedBy}`} sub={ROLE_LABEL[report.submittedByRole]} />
              <Row label="Status" value={<StatusBadge status={report.status} />} />
              <Row label="Priority" value={<PriorityBadge priority={report.priority} />} />
              <Row label="Assigned to" value={assignee ? assignee.name : "Unassigned"} sub={assignee ? `${assignee.role}, ${assignee.department}` : undefined} />
              <Row label="Submitted" value={formatDateTime(report.submittedAt)} />
              <Row label="Last updated" value={`${formatDate(report.updatedAt)} (${formatRelative(report.updatedAt)})`} />
            </dl>
          </Card>

          {canManage ? (
            <Card>
              <CardHeader title="Manage report" subtitle={`${ROLE_LABEL[role]} demo actions`} />
              <div className="space-y-4 px-5 py-4">
                <div>
                  <label htmlFor="set-status" className="mb-1.5 block text-sm font-medium text-ink">
                    Update status
                  </label>
                  <div className="flex gap-2">
                    <Select
                      id="set-status"
                      value={pendingStatus}
                      onChange={(e) => setPendingStatus(e.target.value as ReportStatus)}
                      aria-label="New status"
                    >
                      <option value="">Choose…</option>
                      {otherStatuses.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </Select>
                    <Button
                      variant="secondary"
                      disabled={!pendingStatus}
                      onClick={() => {
                        if (!pendingStatus) return;
                        updateStatus(report.id, pendingStatus);
                        pushToast("success", `Status set to ${STATUS_LABEL[pendingStatus]}. Simulated locally.`);
                        setPendingStatus("");
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                <div>
                  <label htmlFor="set-assignee" className="mb-1.5 block text-sm font-medium text-ink">
                    Assign staff member
                  </label>
                  <div className="flex gap-2">
                    <Select
                      id="set-assignee"
                      value={pendingAssignee}
                      onChange={(e) => setPendingAssignee(e.target.value)}
                      aria-label="Staff member"
                    >
                      <option value=" ">Unassigned</option>
                      {staff.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} · {s.department}
                        </option>
                      ))}
                    </Select>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        assignReport(report.id, pendingAssignee.trim() === "" ? null : pendingAssignee);
                        pushToast(
                          "success",
                          pendingAssignee.trim() === "" ? "Assignment cleared (simulated)." : "Report assigned (simulated)."
                        );
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>

                <p className="text-xs leading-5 text-muted">
                  These actions update local demo state only. A production backend would check permissions on the
                  server before applying them.
                </p>
              </div>
            </Card>
          ) : (
            <Card>
              <CardHeader title="What happens next" />
              <div className="px-5 py-4 text-sm leading-6 text-muted">
                <p>
                  In the live product, campus staff would review this report, assign it, and update its status. In this
                  demo the Student role can watch the timeline and add comments; switching to the Staff or
                  Administrator demo role reveals the management actions.
                </p>
              </div>
            </Card>
          )}

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-page">
                <UserRoundCheck className="h-4 w-4 text-muted" />
              </span>
              <p className="text-xs leading-5 text-muted">
                Assignment data, staff names and timelines are fictional demo content stored in your browser.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <div className="sr-only" aria-live="polite">
        {`Report ${report.id}, status ${STATUS_LABEL[report.status]}`}
      </div>
    </div>
  );
}

function Row({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="text-right">
        <span className="font-medium text-ink">{value}</span>
        {sub ? <span className="block text-xs font-normal text-muted">{sub}</span> : null}
      </dd>
    </div>
  );
}
