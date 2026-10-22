import type {
  ReportCategory,
  ReportPriority,
  ReportStatus,
  Role,
} from "@/types";

/** Brand hex values (mirrored in tailwind.config.ts). */
export const BRAND = {
  primary: "#2563EB",
  navy: "#172554",
  page: "#F8FAFC",
  card: "#FFFFFF",
  ink: "#0F172A",
  muted: "#64748B",
  line: "#E2E8F0",
  success: "#15803D",
  warning: "#B45309",
  danger: "#B91C1C",
} as const;

/**
 * Fixed reference moment for the demo dataset. All relative dates and the
 * dashboard greeting are computed against this anchor so the demo is
 * deterministic and free of hydration mismatches. Kept in UTC so server and
 * client rendering always agree regardless of local timezone.
 */
export const DEMO_NOW = new Date("2026-10-22T14:00:00Z");

/** UTC millisecond anchor used by the mock data generator. */
export const DEMO_NOW_MS = DEMO_NOW.getTime();

export const STATUS_LABEL: Record<ReportStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  in_progress: "In progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

export const STATUS_ORDER: ReportStatus[] = [
  "submitted",
  "under_review",
  "in_progress",
  "resolved",
  "rejected",
];

export const CATEGORIES: ReportCategory[] = [
  "Facilities",
  "Electricity",
  "Water",
  "Internet",
  "Safety",
  "Cleaning",
  "Other",
];

export const PRIORITIES: ReportPriority[] = ["Low", "Medium", "High", "Urgent"];

/** Higher number = more urgent; used for priority sorting. */
export const PRIORITY_WEIGHT: Record<ReportPriority, number> = {
  Urgent: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

export const ROLE_LABEL: Record<Role, string> = {
  student: "Student",
  staff: "Staff",
  admin: "Administrator",
};

/** Maximum accepted size for an uploaded report image (5 MB). */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const LEGAL_REVIEW_NOTE =
  "Draft for demonstration purposes. This document has not been reviewed by legal counsel and must be reviewed before any production use.";
