/**
 * Core domain types for Axlori Resolve (frontend demo).
 *
 * These shapes are deliberately close to what a future backend
 * (e.g. Supabase tables: profiles, reports, report_images, comments,
 * status_history, staff_assignments, notifications) would return so the
 * data-access layer in lib/store.tsx can be swapped for real API calls
 * without rebuilding the interface.
 */

export type Role = "student" | "staff" | "admin";

export type ReportStatus =
  | "submitted"
  | "under_review"
  | "in_progress"
  | "resolved"
  | "rejected";

export type ReportCategory =
  | "Facilities"
  | "Electricity"
  | "Water"
  | "Internet"
  | "Safety"
  | "Cleaning"
  | "Other";

export type ReportPriority = "Low" | "Medium" | "High" | "Urgent";

export const ACTIVE_STATUSES: ReportStatus[] = [
  "submitted",
  "under_review",
  "in_progress",
];

export interface UserProfile {
  id: string;
  /** Display name, e.g. "Jomel Adewale" */
  name: string;
  email: string;
  role: Role;
  /** Short organizational label, e.g. "Student" or "Facilities" */
  unit: string;
}

export interface CampusLocation {
  id: string;
  name: string;
  kind: "Academic" | "Residential" | "Administrative" | "Shared";
  /** Grid coordinates on the fictional illustrative campus map (percent, 0-100). */
  mapX: number;
  mapY: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: "Facilities" | "ICT" | "Security" | "Estates" | "Welfare";
  email: string;
  /** Hex color used to render the staff initials avatar. */
  avatarColor: string;
  /** Rough weekly capacity, used only for the demo workload bar. */
  capacity: number;
}

export interface StatusChange {
  status: ReportStatus;
  /** ISO timestamp */
  at: string;
  by: string;
  note?: string;
}

export interface ReportComment {
  id: string;
  author: string;
  authorRole: Role;
  body: string;
  /** ISO timestamp */
  at: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  location: string;
  building?: string;
  priority: ReportPriority;
  status: ReportStatus;
  submittedBy: string;
  submittedByRole: Role;
  /** ISO timestamps */
  submittedAt: string;
  updatedAt: string;
  /** StaffMember.id when assigned */
  assignedTo?: string;
  /** Optional image; object URL or /placeholders/*.svg demo asset */
  imageUrl?: string;
  imageIsDemoPlaceholder?: boolean;
  statusHistory: StatusChange[];
  comments: ReportComment[];
  /** true when created locally in this browser session (mock submission) */
  isLocal?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  /** ISO timestamp */
  at: string;
  read: boolean;
  reportId?: string;
}

export type ToastKind = "success" | "error" | "info";

export interface ToastMessage {
  id: number;
  kind: ToastKind;
  text: string;
}

export interface UserSettings {
  displayName: string;
  email: string;
  compactTables: boolean;
  reduceMotion: boolean;
  notifyStatusUpdates: boolean;
  notifyComments: boolean;
  notifyAssignments: boolean;
  weeklyDigest: boolean;
}

export interface OverviewStats {
  openCount: number;
  inProgressCount: number;
  resolvedThisMonth: number;
  avgResolutionDays: number | null;
}

export interface CategoryCount {
  category: ReportCategory;
  count: number;
}

export interface StatusCount {
  status: ReportStatus;
  count: number;
}

export interface TimeBucket {
  label: string;
  submitted: number;
  resolved: number;
}

export interface LocationCount {
  location: string;
  count: number;
}
