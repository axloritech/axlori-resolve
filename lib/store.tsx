"use client";

/**
 * Frontend-only data store.
 *
 * This module is the single seam between the UI and the data source. Today it
 * serves the deterministic mock dataset plus mutations kept in memory and
 * persisted to localStorage (clearly a demo, nothing reaches a server). When a
 * backend is connected, the exported hook surface (listReports, addReport,
 * addComment, updateStatus, assignReport, ...) can be re-implemented on top of
 * real API calls without changing the components. Frontend role checks are a
 * presentation aid only; a real backend must enforce permissions independently.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { DEMO_NOW, ROLE_LABEL } from "@/lib/constants";
import {
  DEMO_USERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REPORTS,
  nextReportId,
} from "@/lib/mock-data";
import type {
  NotificationItem,
  Report,
  ReportComment,
  ReportStatus,
  Role,
  StaffMember,
  ToastMessage,
  UserProfile,
  UserSettings,
} from "@/types";
import { STAFF } from "@/lib/mock-data";

const LS = {
  role: "axlori.role",
  localReports: "axlori.localReports.v1",
  patches: "axlori.reportPatches.v1",
  settings: "axlori.settings.v1",
  notifRead: "axlori.notifRead.v1",
} as const;

interface ReportPatch {
  status?: ReportStatus;
  assignedTo?: string;
  addedHistory?: Report["statusHistory"];
  addedComments?: ReportComment[];
}

type PatchMap = Record<string, ReportPatch>;

export interface StoreValue {
  role: Role;
  setRole: (role: Role) => void;
  currentUser: UserProfile;
  staff: StaffMember[];
  reports: Report[];
  /** Reports visible to the active demo role. */
  visibleReports: Report[];
  getReport: (id: string) => Report | undefined;
  addReport: (input: NewReportInput) => Report;
  addComment: (reportId: string, body: string) => void;
  updateStatus: (reportId: string, status: ReportStatus, note?: string) => void;
  assignReport: (reportId: string, staffId: string | null) => void;
  notifications: NotificationItem[];
  unreadCount: number;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  settings: UserSettings;
  saveSettings: (patch: Partial<UserSettings>) => void;
  toasts: ToastMessage[];
  pushToast: (kind: ToastMessage["kind"], text: string) => void;
  dismissToast: (id: number) => void;
  /** True once localStorage has been read (client-only persisted demo state). */
  hydrated: boolean;
}

export interface NewReportInput {
  title: string;
  description: string;
  category: Report["category"];
  location: string;
  building?: string;
  priority: Report["priority"];
  imageUrl?: string;
}

const StoreContext = createContext<StoreValue | null>(null);

const DEFAULT_SETTINGS: UserSettings = {
  displayName: DEMO_USERS.student.name,
  email: DEMO_USERS.student.email,
  compactTables: false,
  reduceMotion: false,
  notifyStatusUpdates: true,
  notifyComments: true,
  notifyAssignments: true,
  weeklyDigest: false,
};

/** Large data-URL images are kept for the live session but not persisted to localStorage. */
function sanitizeLocalForStorage(reports: Report[]): Report[] {
  return reports.map((r) =>
    r.imageUrl && r.imageUrl.startsWith("data:") && r.imageUrl.length > 800000
      ? { ...r, imageUrl: undefined }
      : r
  );
}

function applyPatches(base: Report[], local: Report[], patches: PatchMap): Report[] {
  const merged = base.map((r) => {
    const p = patches[r.id];
    if (!p) return r;
    const next: Report = { ...r };
    let changed = false;
    if (p.status && p.status !== next.status) {
      next.status = p.status;
      changed = true;
    }
    if (p.assignedTo !== undefined && p.assignedTo !== next.assignedTo) {
      next.assignedTo = p.assignedTo || undefined;
      changed = true;
    }
    if (p.addedHistory?.length) {
      next.statusHistory = [...next.statusHistory, ...p.addedHistory];
      changed = true;
    }
    if (p.addedComments?.length) {
      next.comments = [...next.comments, ...p.addedComments];
      changed = true;
    }
    if (changed) next.updatedAt = next.statusHistory[next.statusHistory.length - 1].at;
    return next;
  });
  return [...local, ...merged];
}

let toastSeq = 1;

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("student");
  const [localReports, setLocalReports] = useState<Report[]>([]);
  const [patches, setPatches] = useState<PatchMap>({});
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [notifRead, setNotifRead] = useState<Record<string, string[]>>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);

  // Load persisted demo state after mount (avoids SSR/CSR mismatch).
  useEffect(() => {
    try {
      const savedRole = window.localStorage.getItem(LS.role) as Role | null;
      if (savedRole === "student" || savedRole === "staff" || savedRole === "admin") {
        setRoleState(savedRole);
      }
      const savedLocal = window.localStorage.getItem(LS.localReports);
      if (savedLocal) setLocalReports(JSON.parse(savedLocal) as Report[]);
      const savedPatches = window.localStorage.getItem(LS.patches);
      if (savedPatches) setPatches(JSON.parse(savedPatches) as PatchMap);
      const savedSettings = window.localStorage.getItem(LS.settings);
      if (savedSettings) setSettings({ ...DEFAULT_SETTINGS, ...(JSON.parse(savedSettings) as Partial<UserSettings>) });
      const savedNotif = window.localStorage.getItem(LS.notifRead);
      if (savedNotif) setNotifRead(JSON.parse(savedNotif) as Record<string, string[]>);
    } catch {
      // Corrupt or unavailable storage: keep the in-memory defaults.
    }
    hydratedRef.current = true;
    setHydrated(true);
  }, []);

  const persist = useCallback((key: string, value: unknown) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable; state still works for the session.
    }
  }, []);

  const pushToast = useCallback((kind: ToastMessage["kind"], text: string) => {
    const id = toastSeq++;
    setToasts((ts) => [...ts, { id, kind, text }]);
    window.setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 4200);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const setRole = useCallback(
    (next: Role) => {
      setRoleState(next);
      // Settings profile tracks the active persona when untouched by the user.
      setSettings((s) => {
        const persona = DEMO_USERS[next];
        const stillDefault =
          s.displayName === DEMO_USERS.student.name ||
          s.displayName === DEMO_USERS.staff.name ||
          s.displayName === DEMO_USERS.admin.name;
        const merged = stillDefault
          ? { ...s, displayName: persona.name, email: persona.email }
          : { ...s, email: s.email };
        if (hydratedRef.current) persist(LS.settings, merged);
        return merged;
      });
      if (hydratedRef.current) persist(LS.role, next);
      pushToast("info", `Demo role changed to ${ROLE_LABEL[next]}. This is not a sign-in.`);
    },
    [persist, pushToast]
  );

  const currentUser = useMemo<UserProfile>(() => {
    const base = DEMO_USERS[role];
    return { ...base, name: settings.displayName || base.name, email: settings.email || base.email };
  }, [role, settings.displayName, settings.email]);

  const reports = useMemo(
    () => applyPatches(INITIAL_REPORTS, localReports, patches),
    [localReports, patches]
  );

  const visibleReports = useMemo(() => {
    if (role === "student") {
      return reports.filter((r) => r.submittedBy === currentUser.name || r.isLocal);
    }
    return reports;
  }, [reports, role, currentUser.name]);

  const getReport = useCallback(
    (id: string) => reports.find((r) => r.id === id),
    [reports]
  );

  const addReport = useCallback(
    (input: NewReportInput): Report => {
      const id = nextReportId([...INITIAL_REPORTS, ...localReports]);
      const now = DEMO_NOW.toISOString();
      const report: Report = {
        id,
        title: input.title,
        description: input.description,
        category: input.category,
        location: input.location,
        building: input.building || undefined,
        priority: input.priority,
        status: "submitted",
        submittedBy: currentUser.name,
        submittedByRole: role,
        submittedAt: now,
        updatedAt: now,
        imageUrl: input.imageUrl,
        statusHistory: [
          { status: "submitted", at: now, by: currentUser.name, note: "Submitted locally during the frontend demo. Not sent to a server." },
        ],
        comments: [],
        isLocal: true,
      };
      setLocalReports((prev) => {
        const next = [report, ...prev];
        if (hydratedRef.current) persist(LS.localReports, sanitizeLocalForStorage(next));
        return next;
      });
      return report;
    },
    [currentUser.name, localReports, persist, role]
  );

  const patchReport = useCallback(
    (id: string, fn: (patch: ReportPatch) => Partial<ReportPatch>) => {
      setPatches((prev) => {
        const existing = prev[id] ?? {};
        const delta = fn(existing);
        const merged: ReportPatch = {
          ...existing,
          ...delta,
          addedHistory: [...(existing.addedHistory ?? []), ...(delta.addedHistory ?? [])],
          addedComments: [...(existing.addedComments ?? []), ...(delta.addedComments ?? [])],
        };
        const next = { ...prev, [id]: merged };
        if (hydratedRef.current) persist(LS.patches, next);
        return next;
      });
    },
    [persist]
  );

  const addComment = useCallback(
    (reportId: string, body: string) => {
      const comment: ReportComment = {
        id: `c-local-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`,
        author: currentUser.name,
        authorRole: role,
        body,
        at: DEMO_NOW.toISOString(),
      };
      const target = localReports.find((r) => r.id === reportId);
      if (target) {
        setLocalReports((prev) => {
          const next = prev.map((r) => (r.id === reportId ? { ...r, comments: [...r.comments, comment], updatedAt: comment.at } : r));
          if (hydratedRef.current) persist(LS.localReports, sanitizeLocalForStorage(next));
          return next;
        });
      } else {
        patchReport(reportId, () => ({ addedComments: [comment] }));
      }
    },
    [currentUser.name, localReports, patchReport, persist, role]
  );

  const updateStatus = useCallback(
    (reportId: string, status: ReportStatus, note?: string) => {
      const entry = {
        status,
        at: DEMO_NOW.toISOString(),
        by: currentUser.name,
        note: note ?? "Status changed locally during the frontend demo.",
      };
      const isLocal = localReports.some((r) => r.id === reportId);
      if (isLocal) {
        setLocalReports((prev) => {
          const next = prev.map((r) =>
            r.id === reportId ? { ...r, status, statusHistory: [...r.statusHistory, entry], updatedAt: entry.at } : r
          );
          if (hydratedRef.current) persist(LS.localReports, sanitizeLocalForStorage(next));
          return next;
        });
      } else {
        patchReport(reportId, () => ({ status, addedHistory: [entry] }));
      }
    },
    [currentUser.name, localReports, patchReport, persist]
  );

  const assignReport = useCallback(
    (reportId: string, staffId: string | null) => {
      const isLocal = localReports.some((r) => r.id === reportId);
      if (isLocal) {
        setLocalReports((prev) => {
          const next = prev.map((r) =>
            r.id === reportId
              ? { ...r, assignedTo: staffId ?? undefined, updatedAt: DEMO_NOW.toISOString() }
              : r
          );
          if (hydratedRef.current) persist(LS.localReports, sanitizeLocalForStorage(next));
          return next;
        });
      } else {
        patchReport(reportId, () => ({ assignedTo: staffId ?? "" }));
      }
    },
    [localReports, patchReport, persist]
  );

  const notifications = useMemo<NotificationItem[]>(() => {
    const base = INITIAL_NOTIFICATIONS[role] ?? [];
    const readIds = new Set(notifRead[role] ?? []);
    return base.map((n) => ({ ...n, read: n.read || readIds.has(n.id) }));
  }, [role, notifRead]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markAllNotificationsRead = useCallback(() => {
    setNotifRead((prev) => {
      const ids = (INITIAL_NOTIFICATIONS[role] ?? []).map((n) => n.id);
      const next = { ...prev, [role]: Array.from(new Set([...(prev[role] ?? []), ...ids])) };
      if (hydratedRef.current) persist(LS.notifRead, next);
      return next;
    });
  }, [persist, role]);

  const markNotificationRead = useCallback(
    (id: string) => {
      setNotifRead((prev) => {
        const next = { ...prev, [role]: Array.from(new Set([...(prev[role] ?? []), id])) };
        if (hydratedRef.current) persist(LS.notifRead, next);
        return next;
      });
    },
    [persist, role]
  );

  const saveSettings = useCallback(
    (patch: Partial<UserSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        if (hydratedRef.current) persist(LS.settings, next);
        return next;
      });
      pushToast("success", "Settings saved. They apply to this demo browser only.");
    },
    [persist, pushToast]
  );

  const value = useMemo<StoreValue>(
    () => ({
      role,
      setRole,
      currentUser,
      staff: STAFF,
      reports,
      visibleReports,
      getReport,
      addReport,
      addComment,
      updateStatus,
      assignReport,
      notifications,
      unreadCount,
      markAllNotificationsRead,
      markNotificationRead,
      settings,
      saveSettings,
      toasts,
      pushToast,
      dismissToast,
      hydrated,
    }),
    [
      role,
      setRole,
      currentUser,
      reports,
      visibleReports,
      getReport,
      addReport,
      addComment,
      updateStatus,
      assignReport,
      notifications,
      unreadCount,
      markAllNotificationsRead,
      markNotificationRead,
      settings,
      saveSettings,
      toasts,
      pushToast,
      dismissToast,
      hydrated,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore must be used inside <AppProvider>");
  return ctx;
}
