"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRound } from "lucide-react";

import Logo from "@/components/layout/Logo";
import { itemsForRole } from "@/components/layout/nav-config";
import RoleSwitcher from "@/components/layout/RoleSwitcher";
import { ROLE_LABEL } from "@/lib/constants";
import { WORKSPACE_NAME } from "@/lib/site";
import { useAppStore } from "@/lib/store";
import { cx, initialsOf } from "@/lib/utils";

/**
 * Shared sidebar content used by the persistent desktop sidebar and the
 * mobile drawer.
 */
export default function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { role, currentUser, visibleReports } = useAppStore();
  const items = itemsForRole(role);
  const openCount = visibleReports.filter(
    (r) => r.status === "submitted" || r.status === "under_review" || r.status === "in_progress"
  ).length;

  return (
    <div className="flex h-full flex-col bg-navy text-slate-200">
      <div className="px-5 pt-6">
        <Link href="/" onClick={onNavigate} aria-label="Axlori Resolve overview">
          <Logo />
        </Link>
      </div>

      <nav aria-label="Main navigation" className="mt-6 flex-1 overflow-y-auto px-3">
        <ul className="space-y-1">
          {items.map(({ href, label, Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "border-primary bg-white/10 font-medium text-white"
                      : "border-transparent text-slate-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon aria-hidden className={cx("h-[18px] w-[18px]", active ? "text-white" : "text-slate-400")} />
                  <span className="flex-1">{label}</span>
                  {label === "Reports" ? (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-200" aria-label={`${openCount} active reports`}>
                      {openCount}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-3 px-3 pb-5">
        <RoleSwitcher />
        <div className="rounded-lg border border-white/10 p-3">
          <div className="flex items-center gap-3">
            <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              {initialsOf(currentUser.name)}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium text-white">{currentUser.name}</p>
              <p className="truncate text-xs text-slate-400">{ROLE_LABEL[currentUser.role]}</p>
            </div>
            <Link
              href="/settings"
              onClick={onNavigate}
              aria-label="Open profile settings"
              className="ml-auto rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <UserRound aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="px-1">
          <p className="text-xs text-slate-500">{WORKSPACE_NAME}</p>
          <p className="mt-1 flex gap-3 text-xs">
            <Link href="/terms" onClick={onNavigate} className="text-slate-400 underline-offset-2 hover:text-white hover:underline">
              Terms
            </Link>
            <Link href="/privacy" onClick={onNavigate} className="text-slate-400 underline-offset-2 hover:text-white hover:underline">
              Privacy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
