/**
 * Mock dataset for the Axlori Resolve frontend demo.
 *
 * Everything in this file is fictional demonstration data: campus locations,
 * people, reports, comments and resolutions are invented, and no real
 * students or staff are represented. The dataset is generated
 * deterministically (seeded RNG, fixed UTC anchor) so it is stable across
 * renders, refreshes and server/client boundaries.
 *
 * Derived numbers the dashboard reports are computed from this dataset in
 * lib/stats.ts and intentionally match the product demo screenshot
 * (24 open, 12 in progress, 86 resolved this month, 1.8 days average).
 *
 * When a real backend is connected, this file is replaced by API calls; the
 * exported shapes mirror the planned tables (profiles, reports,
 * status_history, comments, staff_assignments, notifications).
 */

import { DEMO_NOW_MS } from "@/lib/constants";
import { REPORT_ID_PREFIX } from "@/lib/site";
import { seededRandom } from "@/lib/utils";
import type {
  CampusLocation,
  NotificationItem,
  Report,
  ReportCategory,
  ReportPriority,
  ReportStatus,
  Role,
  StaffMember,
  StatusChange,
  UserProfile,
} from "@/types";

/* ------------------------------------------------------------------ */
/* People (fictional demo personas only)                                */
/* ------------------------------------------------------------------ */

export const DEMO_USERS: Record<Role, UserProfile> = {
  student: {
    id: "u-student",
    name: "Jomel Adewale",
    email: "jomel.adewale@student.example.com",
    role: "student",
    unit: "Undergraduate student",
  },
  staff: {
    id: "u-staff",
    name: "Adaeze Okafor",
    email: "adaeze.okafor@staff.example.com",
    role: "staff",
    unit: "Facilities",
  },
  admin: {
    id: "u-admin",
    name: "Tunde Bakare",
    email: "tunde.bakare@admin.example.com",
    role: "admin",
    unit: "Workspace administration",
  },
};

export const STAFF: StaffMember[] = [
  { id: "s-01", name: "Adaeze Okafor", role: "Facilities Coordinator", department: "Facilities", email: "adaeze.okafor@staff.example.com", avatarColor: "#2563EB", capacity: 8 },
  { id: "s-02", name: "Emeka Nwosu", role: "Electrician", department: "Facilities", email: "emeka.nwosu@staff.example.com", avatarColor: "#0F766E", capacity: 8 },
  { id: "s-03", name: "Blessing Etim", role: "ICT Support Officer", department: "ICT", email: "blessing.etim@staff.example.com", avatarColor: "#B45309", capacity: 8 },
  { id: "s-04", name: "Suleiman Garba", role: "Network Engineer", department: "ICT", email: "suleiman.garba@staff.example.com", avatarColor: "#6D28D9", capacity: 8 },
  { id: "s-05", name: "Chiamaka Obi", role: "Security Supervisor", department: "Security", email: "chiamaka.obi@staff.example.com", avatarColor: "#B91C1C", capacity: 6 },
  { id: "s-06", name: "Ibrahim Danladi", role: "Estates Officer", department: "Estates", email: "ibrahim.danladi@staff.example.com", avatarColor: "#15803D", capacity: 8 },
  { id: "s-07", name: "Funmilayo Ade", role: "Cleaning Services Lead", department: "Estates", email: "funmilayo.ade@staff.example.com", avatarColor: "#0369A1", capacity: 8 },
  { id: "s-08", name: "Kelechi Anya", role: "Student Welfare Officer", department: "Welfare", email: "kelechi.anya@staff.example.com", avatarColor: "#9D174D", capacity: 6 },
];

const SUBMITTERS = [
  "Amara Chinonso",
  "Kelechi Obi",
  "Funmi Adebayo",
  "Ibrahim Musa",
  "Ngozi Eze",
  "Tobi Afolabi",
  "Hauwa Bello",
  "Chinedu Okonkwo",
];

/* ------------------------------------------------------------------ */
/* Campus locations (fictional campus, illustrative map only)           */
/* ------------------------------------------------------------------ */

export const LOCATIONS: CampusLocation[] = [
  { id: "loc-library", name: "Main Library", kind: "Academic", mapX: 24, mapY: 20 },
  { id: "loc-eng-a", name: "Engineering Block A", kind: "Academic", mapX: 58, mapY: 14 },
  { id: "loc-science", name: "Science Complex", kind: "Academic", mapX: 80, mapY: 30 },
  { id: "loc-cafeteria", name: "Central Cafeteria", kind: "Shared", mapX: 40, mapY: 34 },
  { id: "loc-union", name: "Student Union Building", kind: "Shared", mapX: 53, mapY: 46 },
  { id: "loc-ict", name: "ICT Centre", kind: "Academic", mapX: 70, mapY: 52 },
  { id: "loc-hostel-a", name: "Hostel Block A", kind: "Residential", mapX: 16, mapY: 56 },
  { id: "loc-hostel-b", name: "Hostel Block B", kind: "Residential", mapX: 32, mapY: 70 },
  { id: "loc-sports", name: "Sports Complex", kind: "Shared", mapX: 80, mapY: 66 },
  { id: "loc-admin", name: "Administrative Building", kind: "Administrative", mapX: 60, mapY: 80 },
];

export const LOCATION_NAMES = LOCATIONS.map((l) => l.name);

/* ------------------------------------------------------------------ */
/* Deterministic generator                                              */
/* ------------------------------------------------------------------ */

const rand = seededRandom(20261022);
function r() {
  return rand();
}
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(r() * arr.length)];
}
function range(min: number, max: number): number {
  return min + r() * (max - min);
}
function iso(ms: number): string {
  return new Date(ms).toISOString();
}
function jitter(minMs: number, maxMs: number): number {
  return range(minMs, maxMs);
}

const DAY = 86400000;

let idCounter = 1101;
function nextId(): string {
  return `${REPORT_ID_PREFIX}${idCounter++}`;
}
function commentId(n: number): string {
  return `c-${n.toString(36)}`;
}
let commentCounter = 1;

const CATEGORY_WEIGHTS: Array<[ReportCategory, number]> = [
  ["Facilities", 30],
  ["Electricity", 18],
  ["Water", 14],
  ["Internet", 14],
  ["Safety", 8],
  ["Cleaning", 10],
  ["Other", 6],
];
const weightedCategory = (() => {
  const total = CATEGORY_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  return (): ReportCategory => {
    let x = r() * total;
    for (const [cat, w] of CATEGORY_WEIGHTS) {
      if ((x -= w) <= 0) return cat;
    }
    return "Facilities";
  };
})();

const TITLE_BANK: Record<ReportCategory, string[]> = {
  Facilities: [
    "Broken door hinge in {loc}",
    "Leaking ceiling in {loc}",
    "Damaged seating in {loc}",
    "Faulty door lock in {loc}",
    "Broken whiteboard bracket in {loc}",
    "Cracked floor tiles in {loc}",
  ],
  Electricity: [
    "Power socket not working in {loc}",
    "Flickering corridor lights in {loc}",
    "Repeated breaker trips in {loc}",
    "Streetlight out near {loc}",
    "Faulty fan regulator in {loc}",
    "Exposed wiring panel in {loc}",
  ],
  Water: [
    "No running water in {loc}",
    "Burst pipe near {loc}",
    "Low water pressure in {loc}",
    "Overflowing gutter behind {loc}",
    "Faulty tap in {loc} washrooms",
    "Water heater not working in {loc}",
  ],
  Internet: [
    "Wi-Fi drops every few minutes in {loc}",
    "No network coverage in {loc}",
    "Ethernet ports dead in {loc}",
    "Slow connection in {loc} during peak hours",
    "Router fault reported in {loc}",
    "Captive portal loop in {loc}",
  ],
  Safety: [
    "Poor lighting on walkway by {loc}",
    "Broken perimeter rail near {loc}",
    "Slippery steps at {loc} entrance",
    "Fire extinguisher missing in {loc}",
    "Loose signage near {loc}",
    "Blocked emergency exit in {loc}",
  ],
  Cleaning: [
    "Washrooms need attention in {loc}",
    "Overflowing bins at {loc}",
    "Spillage not cleaned in {loc}",
    "Dust build-up in {loc} hallways",
    "Stairwell needs sweeping in {loc}",
    "Pest sighting reported in {loc}",
  ],
  Other: [
    "Noise disturbance near {loc}",
    "Signage update needed for {loc}",
    "Lost and found desk query at {loc}",
    "Vending machine refund issue in {loc}",
    "Timetable display out of date in {loc}",
    "Accessibility ramp issue at {loc}",
  ],
};

const PRIORITY_POOL: ReportPriority[] = [
  "Low",
  "Medium",
  "Medium",
  "Medium",
  "High",
  "High",
  "Urgent",
];

const BUILDING_HINTS = [
  "Ground floor",
  "1st floor",
  "2nd floor",
  "Room 12",
  "Room 204",
  "East wing",
  "West wing",
  "Main entrance",
  "",
  "",
];

function makeDescription(category: ReportCategory, title: string, location: string): string {
  const clean = title.charAt(0).toLowerCase() + title.slice(1);
  return `${clean.charAt(0).toUpperCase() + clean.slice(1)} reported at ${location}. Submitted through the campus reporting channel with a request for inspection. This entry is part of the fictional demo dataset and does not describe a real incident.`;
}

function makeHistory(
  submittedAt: string,
  status: ReportStatus,
  submittedBy: string,
  actor: string,
  resolvedAt?: string,
  extraNote?: string
): StatusChange[] {
  const history: StatusChange[] = [{ status: "submitted", at: submittedAt, by: submittedBy }];
  const sub = new Date(submittedAt).getTime();
  if (status === "submitted") return history;

  // When a resolution time is known (resolved / rejected reports), space the
  // intermediate events proportionally inside the submission -> resolution
  // window so timestamps always increase.
  const end = resolvedAt ? new Date(resolvedAt).getTime() : null;
  const span = end ? end - sub : null;

  const reviewAtMs = span
    ? sub + Math.max(span * 0.18, 30 * 60000)
    : sub + jitter(2 * 3600000, 20 * 3600000);
  history.push({
    status: "under_review",
    at: iso(reviewAtMs),
    by: actor,
    note: "Report reviewed and queued for assessment.",
  });

  if (status === "under_review" || status === "rejected") {
    if (status === "rejected") {
      history.push({
        status: "rejected",
        at: iso(new Date(reviewAtMs).getTime() + jitter(6 * 3600000, 26 * 3600000)),
        by: actor,
        note: "Closed after assessment. See comments for details.",
      });
    }
    return history;
  }

  const progressAtMs = span
    ? sub + Math.max(span * 0.18, 30 * 60000) + (span - Math.max(span * 0.18, 30 * 60000)) * range(0.25, 0.6)
    : reviewAtMs + jitter(3 * 3600000, 18 * 3600000);
  history.push({
    status: "in_progress",
    at: iso(progressAtMs),
    by: actor,
    note: extraNote ?? "Work assigned and underway.",
  });

  if (status === "in_progress") return history;

  const finalAt = resolvedAt ?? iso(progressAtMs + jitter(6 * 3600000, 30 * 3600000));
  history.push({
    status,
    at: finalAt,
    by: actor,
    note: "Work completed and verified.",
  });
  return history;
}

function staffFor(category: ReportCategory): StaffMember {
  const dept =
    category === "Internet"
      ? "ICT"
      : category === "Safety"
        ? "Security"
        : category === "Cleaning"
          ? "Estates"
          : "Facilities";
  const options = STAFF.filter((s) => s.department === dept);
  return pick(options.length ? options : STAFF);
}

interface GeneratedSpec {
  status: ReportStatus;
  submittedMsAgo: [number, number];
  resolvedMsAgo?: [number, number];
}

function generatedReport(spec: GeneratedSpec): Report {
  const category = weightedCategory();
  const location = pick(LOCATIONS);
  const title = pick(TITLE_BANK[category]).replace("{loc}", location.name);
  const priority = pick(PRIORITY_POOL);
  const submittedBy = pick(SUBMITTERS);
  const submittedAt = iso(DEMO_NOW_MS - range(spec.submittedMsAgo[0], spec.submittedMsAgo[1]));
  const staff = staffFor(category);
  const building = pick(BUILDING_HINTS);

  let status: ReportStatus = spec.status;
  let resolvedAt: string | undefined;
  if (spec.resolvedMsAgo) {
    resolvedAt = iso(DEMO_NOW_MS - range(spec.resolvedMsAgo[0], spec.resolvedMsAgo[1]));
  }

  const history = makeHistory(submittedAt, status, submittedBy, staff.name, resolvedAt);
  const last = history[history.length - 1];

  return {
    id: nextId(),
    title,
    description: makeDescription(category, title, location.name),
    category,
    location: location.name,
    building: building || undefined,
    priority,
    status,
    submittedBy,
    submittedByRole: "student",
    submittedAt,
    updatedAt: last.at,
    assignedTo:
      status === "in_progress" || status === "resolved" ? staff.id : status === "under_review" && r() < 0.5 ? staff.id : undefined,
    statusHistory: history,
    comments: [],
  };
}

/* ------------------------------------------------------------------ */
/* Featured hand-written reports (submitted by the demo student)        */
/* ------------------------------------------------------------------ */

function featured(
  rawId: number,
  title: string,
  category: ReportCategory,
  location: string,
  priority: ReportPriority,
  status: ReportStatus,
  history: StatusChange[],
  opts: Partial<Pick<Report, "building" | "assignedTo" | "imageUrl" | "imageIsDemoPlaceholder">> & {
    comments?: Report["comments"];
  } = {}
): Report {
  return {
    id: `${REPORT_ID_PREFIX}${rawId}`,
    title,
    description: "",
    category,
    location,
    building: opts.building,
    priority,
    status,
    submittedBy: DEMO_USERS.student.name,
    submittedByRole: "student",
    submittedAt: history[0].at,
    updatedAt: history[history.length - 1].at,
    assignedTo: opts.assignedTo,
    imageUrl: opts.imageUrl,
    imageIsDemoPlaceholder: opts.imageIsDemoPlaceholder,
    statusHistory: history,
    comments: opts.comments ?? [],
  };
}

const FEATURED: Report[] = [
  featured(
    1047,
    "Broken projector in Lecture Theatre 2",
    "Facilities",
    "Science Complex",
    "High",
    "in_progress",
    [
      { status: "submitted", at: iso(Date.UTC(2026, 9, 19, 9, 12)), by: "Jomel Adewale" },
      { status: "under_review", at: iso(Date.UTC(2026, 9, 19, 11, 40)), by: "Adaeze Okafor", note: "Reviewed and routed to ICT support." },
      { status: "in_progress", at: iso(Date.UTC(2026, 9, 20, 8, 5)), by: "Blessing Etim", note: "Replacement lamp ordered, fitting scheduled." },
    ],
    {
      building: "Lecture Theatre 2",
      assignedTo: "s-03",
      imageUrl: "/placeholders/demo-projector.svg",
      imageIsDemoPlaceholder: true,
      comments: [
        {
          id: commentId(commentCounter++),
          author: "Blessing Etim",
          authorRole: "staff",
          body: "Confirmed the lamp unit has failed. A compatible replacement has been ordered and fitting is scheduled for Thursday morning. The portable lectern display can be used in the meantime. (Demo comment.)",
          at: iso(Date.UTC(2026, 9, 20, 8, 20)),
        },
        {
          id: commentId(commentCounter++),
          author: "Jomel Adewale",
          authorRole: "student",
          body: "Thanks for the update. Thursday works, the afternoon class in that theatre was moved already.",
          at: iso(Date.UTC(2026, 9, 20, 9, 2)),
        },
      ],
    }
  ),
  featured(
    1046,
    "Water supply issue in Hostel Block A",
    "Water",
    "Hostel Block A",
    "High",
    "under_review",
    [
      { status: "submitted", at: iso(Date.UTC(2026, 9, 20, 18, 25)), by: "Jomel Adewale" },
      { status: "under_review", at: iso(Date.UTC(2026, 9, 21, 9, 2)), by: "Adaeze Okafor", note: "Checking whether this matches the planned pump maintenance window." },
    ],
    {
      building: "2nd floor",
      imageUrl: "/placeholders/demo-leak.svg",
      imageIsDemoPlaceholder: true,
      comments: [
        {
          id: commentId(commentCounter++),
          author: "Adaeze Okafor",
          authorRole: "staff",
          body: "Facilities is checking this against the pump maintenance schedule. If it is unrelated to planned works it will be escalated to the plumbing contractor. (Demo comment.)",
          at: iso(Date.UTC(2026, 9, 21, 9, 10)),
        },
      ],
    }
  ),
  featured(
    1045,
    "Campus Wi-Fi outage in Main Library",
    "Internet",
    "Main Library",
    "Urgent",
    "submitted",
    [{ status: "submitted", at: iso(Date.UTC(2026, 9, 22, 8, 41)), by: "Jomel Adewale" }],
    { building: "Reading floors 1-3" }
  ),
  featured(
    1044,
    "Air conditioning failure in Lecture Hall C",
    "Electricity",
    "Engineering Block A",
    "Medium",
    "resolved",
    [
      { status: "submitted", at: iso(Date.UTC(2026, 9, 13, 7, 55)), by: "Jomel Adewale" },
      { status: "under_review", at: iso(Date.UTC(2026, 9, 13, 10, 30)), by: "Adaeze Okafor" },
      { status: "in_progress", at: iso(Date.UTC(2026, 9, 13, 13, 15)), by: "Emeka Nwosu", note: "Compressor relay identified as the fault." },
      { status: "resolved", at: iso(Date.UTC(2026, 9, 15, 11, 40)), by: "Emeka Nwosu", note: "Relay replaced, unit tested under load." },
    ],
    {
      building: "Lecture Hall C",
      assignedTo: "s-02",
      comments: [
        {
          id: commentId(commentCounter++),
          author: "Emeka Nwosu",
          authorRole: "staff",
          body: "Unit is back online and holding temperature. Please reopen if it drops again. (Demo comment.)",
          at: iso(Date.UTC(2026, 9, 15, 11, 45)),
        },
      ],
    }
  ),
  featured(
    1043,
    "Broken window latch in Reading Room 3",
    "Facilities",
    "Main Library",
    "Low",
    "submitted",
    [{ status: "submitted", at: iso(Date.UTC(2026, 9, 21, 16, 3)), by: "Jomel Adewale" }],
    { building: "Reading Room 3" }
  ),
  featured(
    1041,
    "Flickering lights along Hostel B walkway",
    "Electricity",
    "Hostel Block B",
    "Medium",
    "submitted",
    [{ status: "submitted", at: iso(Date.UTC(2026, 9, 17, 19, 22)), by: "Jomel Adewale" }],
    { building: "North walkway" }
  ),
  featured(
    1039,
    "Chair shortage in quiet study area",
    "Facilities",
    "Main Library",
    "Medium",
    "resolved",
    [
      { status: "submitted", at: iso(Date.UTC(2026, 9, 6, 10, 14)), by: "Jomel Adewale" },
      { status: "under_review", at: iso(Date.UTC(2026, 9, 6, 13, 46)), by: "Adaeze Okafor" },
      { status: "in_progress", at: iso(Date.UTC(2026, 9, 7, 9, 5)), by: "Funmilayo Ade" },
      { status: "resolved", at: iso(Date.UTC(2026, 9, 8, 12, 30)), by: "Funmilayo Ade", note: "24 chairs relocated from the closed seminar room." },
    ],
    { assignedTo: "s-07", building: "Quiet study area" }
  ),
];

// Fill featured descriptions explicitly (clear, specific copy, demo-labeled).
FEATURED.find((r) => r.id === "AR-1047")!.description =
  "The ceiling projector in Lecture Theatre 2 does not power on. Classes held there this week have been moved to rooms with working displays. Demo report: the attached image is a labelled placeholder, not a real incident photograph.";
FEATURED.find((r) => r.id === "AR-1046")!.description =
  "Taps on the 2nd floor of Hostel Block A have had no running water since yesterday evening. Students are using the ground-floor washrooms. Demo report: the attached image is a labelled placeholder, not a real incident photograph.";
FEATURED.find((r) => r.id === "AR-1045")!.description =
  "No Wi-Fi connectivity across reading floors 1-3 of the Main Library this morning. Mobile data works, so this looks local to the library access points. (Fictional demo report.)";
FEATURED.find((r) => r.id === "AR-1044")!.description =
  "The air conditioning in Lecture Hall C stopped working and the room becomes unusable by mid-morning. (Fictional demo report.)";
FEATURED.find((r) => r.id === "AR-1043")!.description =
  "The latch on the tall window in Reading Room 3 is broken and the window rattles in wind. Low risk, but the room gets cold in the evening. (Fictional demo report.)";
FEATURED.find((r) => r.id === "AR-1041")!.description =
  "Three of the walkway lights between Hostel Block B and the cafeteria flicker badly at night. (Fictional demo report.)";
FEATURED.find((r) => r.id === "AR-1039")!.description =
  "The quiet study area has seating for about half of the students using it this term. (Fictional demo report.)";

/* ------------------------------------------------------------------ */
/* Bulk generation: active queue + resolved archive                     */
/* ------------------------------------------------------------------ */

// In progress: 11 generated (+1 featured, the broken projector) = 12 total
const IN_PROGRESS = Array.from({ length: 11 }, () =>
  generatedReport({ status: "in_progress", submittedMsAgo: [2 * DAY, 14 * DAY] })
);

// Under review: 9 generated (+1 featured = 10)
const UNDER_REVIEW = Array.from({ length: 9 }, () =>
  generatedReport({ status: "under_review", submittedMsAgo: [1 * DAY, 7 * DAY] })
);

// Submitted: 11 generated (+3 featured = 14)
const SUBMITTED = Array.from({ length: 11 }, () =>
  generatedReport({ status: "submitted", submittedMsAgo: [0.1 * DAY, 5 * DAY] })
);

// Rejected: 5 historical
const REJECTED = Array.from({ length: 5 }, (_, i) => {
  const report = generatedReport({
    status: "rejected",
    submittedMsAgo: [4 * DAY + i * 6 * DAY, 4 * DAY + i * 6 * DAY + 12 * 3600000],
  });
  report.updatedAt = report.statusHistory[report.statusHistory.length - 1].at;
  return report;
});

// Resolved this month (October 2026): 86 in total, made of 84 generated reports
// plus the 2 featured resolved reports, with durations averaging 1.8 days.
const RESOLVED_THIS_MONTH_COUNT = 84;
const featuredOctoberResolved = FEATURED.filter((f) => f.status === "resolved");
const featuredResolvedDurationSum = featuredOctoberResolved.reduce((sum, f) => {
  const last = f.statusHistory[f.statusHistory.length - 1];
  return sum + (new Date(last.at).getTime() - new Date(f.submittedAt).getTime()) / DAY;
}, 0);
const resolvedDurations: number[] = Array.from({ length: RESOLVED_THIS_MONTH_COUNT }, () =>
  range(1.05, 2.55)
);
{
  // Adjust every duration by a uniform delta so the mean across ALL October
  // resolutions (generated + featured) is exactly 1.8 days.
  const target = 1.8 * (RESOLVED_THIS_MONTH_COUNT + featuredOctoberResolved.length) - featuredResolvedDurationSum;
  const current = resolvedDurations.reduce((s, d) => s + d, 0);
  const delta = (target - current) / RESOLVED_THIS_MONTH_COUNT;
  for (let i = 0; i < resolvedDurations.length; i++) {
    resolvedDurations[i] = Math.max(0.4, resolvedDurations[i] + delta);
  }
}

const OCTOBER_START_MS = Date.UTC(2026, 9, 1, 0, 0);
const RESOLVED_THIS_MONTH: Report[] = resolvedDurations.map((durationDays) => {
  const resolvedMs = OCTOBER_START_MS + r() * (DEMO_NOW_MS - OCTOBER_START_MS - 3600000);
  const submittedMs = resolvedMs - durationDays * DAY;
  const category = weightedCategory();
  const location = pick(LOCATIONS);
  const title = pick(TITLE_BANK[category]).replace("{loc}", location.name);
  const staff = staffFor(category);
  const submittedBy = pick(SUBMITTERS);
  const submittedAt = iso(submittedMs);
  const history = makeHistory(submittedAt, "resolved", submittedBy, staff.name, iso(resolvedMs));
  return {
    id: nextId(),
    title,
    description: makeDescription(category, title, location.name),
    category,
    location: location.name,
    building: pick(BUILDING_HINTS) || undefined,
    priority: pick(PRIORITY_POOL),
    status: "resolved" as ReportStatus,
    submittedBy,
    submittedByRole: "student" as Role,
    submittedAt,
    updatedAt: history[history.length - 1].at,
    assignedTo: staff.id,
    statusHistory: history,
    comments: [],
  };
});

// Older resolved archive (Jul 27 - Sep 30) so trend charts have history.
const OLD_RESOLVED: Report[] = Array.from({ length: 110 }, () => {
  const resolvedMs = Date.UTC(2026, 6, 27, 8, 0) + r() * (Date.UTC(2026, 9, 0, 17, 0) - Date.UTC(2026, 6, 27, 8, 0));
  const submittedMs = resolvedMs - range(0.8, 3.4) * DAY;
  const category = weightedCategory();
  const location = pick(LOCATIONS);
  const title = pick(TITLE_BANK[category]).replace("{loc}", location.name);
  const staff = staffFor(category);
  const submittedBy = pick(SUBMITTERS);
  const submittedAt = iso(submittedMs);
  const history = makeHistory(submittedAt, "resolved", submittedBy, staff.name, iso(resolvedMs));
  return {
    id: nextId(),
    title,
    description: makeDescription(category, title, location.name),
    category,
    location: location.name,
    building: pick(BUILDING_HINTS) || undefined,
    priority: pick(PRIORITY_POOL),
    status: "resolved" as ReportStatus,
    submittedBy,
    submittedByRole: "student" as Role,
    submittedAt,
    updatedAt: history[history.length - 1].at,
    assignedTo: staff.id,
    statusHistory: history,
    comments: [],
  };
});

export const INITIAL_REPORTS: Report[] = [
  ...FEATURED,
  ...SUBMITTED,
  ...UNDER_REVIEW,
  ...IN_PROGRESS,
  ...REJECTED,
  ...RESOLVED_THIS_MONTH,
  ...OLD_RESOLVED,
];

/* ------------------------------------------------------------------ */
/* Notifications (demo, per role)                                        */
/* ------------------------------------------------------------------ */

export const INITIAL_NOTIFICATIONS: Record<Role, NotificationItem[]> = {
  student: [
    {
      id: "n-1",
      title: "Projector report now in progress",
      body: "AR-1047 was assigned to ICT support. Replacement scheduled for Thursday.",
      at: iso(Date.UTC(2026, 9, 20, 8, 20)),
      read: false,
      reportId: "AR-1047",
    },
    {
      id: "n-2",
      title: "Water supply report under review",
      body: "AR-1046 was reviewed by Facilities and is being checked against planned works.",
      at: iso(Date.UTC(2026, 9, 21, 9, 10)),
      read: false,
      reportId: "AR-1046",
    },
    {
      id: "n-3",
      title: "Report resolved",
      body: "AR-1044 (air conditioning, Lecture Hall C) was marked resolved.",
      at: iso(Date.UTC(2026, 9, 15, 11, 45)),
      read: true,
      reportId: "AR-1044",
    },
  ],
  staff: [
    {
      id: "n-4",
      title: "New urgent report",
      body: "AR-1045 (Wi-Fi outage, Main Library) was submitted with Urgent priority.",
      at: iso(Date.UTC(2026, 9, 22, 8, 41)),
      read: false,
      reportId: "AR-1045",
    },
    {
      id: "n-5",
      title: "12 reports in progress",
      body: "Weekly queue summary for the Facilities workspace (demo notification).",
      at: iso(Date.UTC(2026, 9, 22, 7, 30)),
      read: true,
    },
  ],
  admin: [
    {
      id: "n-6",
      title: "New urgent report",
      body: "AR-1045 (Wi-Fi outage, Main Library) was submitted with Urgent priority.",
      at: iso(Date.UTC(2026, 9, 22, 8, 41)),
      read: false,
      reportId: "AR-1045",
    },
    {
      id: "n-7",
      title: "Monthly resolution average is 1.8 days",
      body: "Computed from the fictional October demo dataset.",
      at: iso(Date.UTC(2026, 9, 22, 7, 0)),
      read: true,
    },
  ],
};

/** Build the next sequential report id from an existing list. */
export function nextReportId(reports: Report[]): string {
  let max = 0;
  for (const rpt of reports) {
    const n = parseInt(rpt.id.replace(REPORT_ID_PREFIX, ""), 10);
    if (!Number.isNaN(n) && n > max) max = n;
  }
  return `${REPORT_ID_PREFIX}${max + 1}`;
}
