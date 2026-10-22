"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Check, Menu, Search, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { titleForPath } from "@/components/layout/nav-config";
import { ROLE_LABEL } from "@/lib/constants";
import { useAppStore } from "@/lib/store";
import { cx, formatRelative, initialsOf } from "@/lib/utils";

/** Close a popover on outside click or Escape. */
function usePopover(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);
  return ref;
}

export default function Topbar({ onOpenNav }: { onOpenNav: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    notifications,
    unreadCount,
    markAllNotificationsRead,
    markNotificationRead,
  } = useAppStore();

  const { crumb, title } = titleForPath(pathname);

  const [query, setQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const notifRef = usePopover(() => setNotifOpen(false));
  const userRef = usePopover(() => setUserOpen(false));

  useEffect(() => {
    setMobileSearchOpen(false);
    setNotifOpen(false);
    setUserOpen(false);
  }, [pathname]);

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setMobileSearchOpen(false);
    router.push(`/reports?q=${encodeURIComponent(q)}`);
  }

  const searchField = (id: string) => (
    <form role="search" onSubmit={submitSearch} className="w-full">
      <label htmlFor={id} className="sr-only">
        Search reports by title, description, or ID
      </label>
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          id={id}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search reports, IDs, locations"
          className="h-10 w-full rounded-lg border border-line bg-page pl-9 pr-3 text-sm text-ink placeholder:text-muted/70 transition-colors focus:border-primary focus:bg-card"
        />
      </div>
    </form>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-card">
      <div className="flex h-16 items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Open navigation menu"
          className="rounded-lg p-2 text-ink transition-colors hover:bg-page lg:hidden"
        >
          <Menu aria-hidden className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted">{crumb}</p>
          <h1 className="truncate text-base font-semibold text-ink sm:text-lg">{title}</h1>
        </div>

        <div className="hidden w-72 md:block lg:w-80">{searchField("topbar-search")}</div>

        <button
          type="button"
          aria-label="Toggle search"
          aria-expanded={mobileSearchOpen}
          onClick={() => setMobileSearchOpen((v) => !v)}
          className="rounded-lg p-2 text-ink transition-colors hover:bg-page md:hidden"
        >
          {mobileSearchOpen ? <X aria-hidden className="h-5 w-5" /> : <Search aria-hidden className="h-5 w-5" />}
        </button>

        <div ref={notifRef} className="relative">
          <button
            type="button"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
            aria-expanded={notifOpen}
            onClick={() => setNotifOpen((v) => !v)}
            className="relative rounded-lg p-2 text-ink transition-colors hover:bg-page"
          >
            <Bell aria-hidden className="h-5 w-5" />
            {unreadCount > 0 ? (
              <span
                aria-hidden
                className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white"
              >
                {unreadCount}
              </span>
            ) : null}
          </button>

          {notifOpen ? (
            <div className="animate-fade-in absolute right-0 mt-2 w-80 rounded-xl border border-line bg-card shadow-pop sm:w-96">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <p className="text-sm font-semibold text-ink">Notifications</p>
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  disabled={unreadCount === 0}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary-hover disabled:cursor-not-allowed disabled:text-muted"
                >
                  <Check aria-hidden className="h-3.5 w-3.5" /> Mark all read
                </button>
              </div>
              <ul className="max-h-80 overflow-y-auto py-1">
                {notifications.length === 0 ? (
                  <li className="px-4 py-6 text-center text-sm text-muted">No notifications in this demo.</li>
                ) : (
                  notifications.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => {
                          markNotificationRead(n.id);
                          setNotifOpen(false);
                          if (n.reportId) router.push(`/reports/${n.reportId}`);
                        }}
                        className={cx(
                          "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-page",
                          !n.read && "bg-primary-subtle/60"
                        )}
                      >
                        <span
                          aria-hidden
                          className={cx("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-line" : "bg-primary")}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-ink">{n.title}</span>
                          <span className="mt-0.5 block text-xs leading-5 text-muted">{n.body}</span>
                          <span className="mt-1 block text-xs text-muted/80">{formatRelative(n.at)}</span>
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
              <p className="border-t border-line px-4 py-2 text-[11px] leading-4 text-muted">
                Demo notifications generated locally. They are not from real users.
              </p>
            </div>
          ) : null}
        </div>

        <div ref={userRef} className="relative">
          <button
            type="button"
            aria-label="Account menu"
            aria-expanded={userOpen}
            onClick={() => setUserOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-page"
          >
            <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
              {initialsOf(currentUser.name)}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block max-w-[140px] truncate text-sm font-medium text-ink">{currentUser.name}</span>
              <span className="block text-xs text-muted">{ROLE_LABEL[currentUser.role]}</span>
            </span>
          </button>

          {userOpen ? (
            <div className="animate-fade-in absolute right-0 mt-2 w-64 rounded-xl border border-line bg-card shadow-pop">
              <div className="border-b border-line px-4 py-3">
                <p className="truncate text-sm font-semibold text-ink">{currentUser.name}</p>
                <p className="truncate text-xs text-muted">{currentUser.email}</p>
                <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-page px-2 py-0.5 text-xs text-muted">
                  <UserRound aria-hidden className="h-3 w-3" /> {ROLE_LABEL[currentUser.role]} (demo)
                </p>
              </div>
              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setUserOpen(false)}
                  className="block px-4 py-2 text-sm text-ink transition-colors hover:bg-page"
                >
                  Profile and settings
                </Link>
                <Link
                  href="/reports/new"
                  onClick={() => setUserOpen(false)}
                  className="block px-4 py-2 text-sm text-ink transition-colors hover:bg-page"
                >
                  Report an issue
                </Link>
              </div>
              <p className="border-t border-line px-4 py-2 text-[11px] leading-4 text-muted">
                Demo profile menu. No account or session exists in this phase.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {mobileSearchOpen ? <div className="border-t border-line px-4 py-2 md:hidden">{searchField("mobile-search")}</div> : null}
    </header>
  );
}
