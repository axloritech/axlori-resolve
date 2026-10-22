"use client";

import { CheckCircle2, Clock3, FilePlus2, Loader, Search, XCircle, type LucideIcon } from "lucide-react";

import { STATUS_LABEL } from "@/lib/constants";
import { cx, formatDateTime } from "@/lib/utils";
import type { StatusChange } from "@/types";

const STATUS_ICON: Record<string, { Icon: LucideIcon; classes: string }> = {
  submitted: { Icon: FilePlus2, classes: "border-slate-200 bg-slate-100 text-slate-600" },
  under_review: { Icon: Search, classes: "border-amber-200 bg-amber-50 text-amber-700" },
  in_progress: { Icon: Loader, classes: "border-blue-200 bg-blue-50 text-blue-700" },
  resolved: { Icon: CheckCircle2, classes: "border-green-200 bg-green-50 text-green-700" },
  rejected: { Icon: XCircle, classes: "border-red-200 bg-red-50 text-red-700" },
};

/** Vertical status history timeline for a report. */
export default function StatusTimeline({ history }: { history: StatusChange[] }) {
  return (
    <ol className="relative space-y-5 border-l border-line pl-6">
      {history.map((h, i) => {
        const style = STATUS_ICON[h.status] ?? { Icon: Clock3, classes: "border-line bg-page text-muted" };
        const Icon = style.Icon;
        const isLast = i === history.length - 1;
        return (
          <li key={`${h.status}-${h.at}-${i}`} className="relative">
            <span
              aria-hidden
              className={cx(
                "absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full border",
                style.classes,
                isLast && "ring-2 ring-primary/30"
              )}
            >
              <Icon className="h-3 w-3" />
            </span>
            <div>
              <p className="text-sm font-medium text-ink">
                {STATUS_LABEL[h.status]}
                {isLast ? <span className="ml-2 text-xs font-normal text-muted">(current)</span> : null}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {h.by} · {formatDateTime(h.at)}
              </p>
              {h.note ? <p className="mt-1 text-xs leading-5 text-muted">{h.note}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
