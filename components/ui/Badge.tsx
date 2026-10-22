import {
  CheckCircle2,
  FilePlus2,
  Loader,
  Search,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { STATUS_LABEL } from "@/lib/constants";
import { cx } from "@/lib/utils";
import type { ReportPriority, ReportStatus } from "@/types";

const STATUS_STYLE: Record<ReportStatus, { classes: string; Icon: LucideIcon }> = {
  submitted: {
    classes: "border-slate-200 bg-slate-100 text-slate-700",
    Icon: FilePlus2,
  },
  under_review: {
    classes: "border-amber-200 bg-amber-50 text-amber-800",
    Icon: Search,
  },
  in_progress: {
    classes: "border-blue-200 bg-blue-50 text-blue-800",
    Icon: Loader,
  },
  resolved: {
    classes: "border-green-200 bg-green-50 text-green-800",
    Icon: CheckCircle2,
  },
  rejected: {
    classes: "border-red-200 bg-red-50 text-red-800",
    Icon: XCircle,
  },
};

/**
 * Status and priority are always conveyed by text (and a small icon for
 * status), never by color alone.
 */
export function StatusBadge({ status, className }: { status: ReportStatus; className?: string }) {
  const { classes, Icon } = STATUS_STYLE[status];
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium",
        classes,
        className
      )}
    >
      <Icon aria-hidden className="h-3.5 w-3.5" />
      {STATUS_LABEL[status]}
    </span>
  );
}

const PRIORITY_STYLE: Record<ReportPriority, { classes: string; dot: string }> = {
  Low: { classes: "border-slate-200 bg-slate-100 text-slate-700", dot: "bg-slate-400" },
  Medium: { classes: "border-blue-200 bg-blue-50 text-blue-800", dot: "bg-blue-500" },
  High: { classes: "border-amber-200 bg-amber-50 text-amber-800", dot: "bg-amber-500" },
  Urgent: { classes: "border-red-200 bg-red-50 text-red-800", dot: "bg-red-500" },
};

export function PriorityBadge({ priority, className }: { priority: ReportPriority; className?: string }) {
  const { classes, dot } = PRIORITY_STYLE[priority];
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium",
        classes,
        className
      )}
    >
      <span aria-hidden className={cx("h-1.5 w-1.5 rounded-full", dot)} />
      {priority}
    </span>
  );
}
