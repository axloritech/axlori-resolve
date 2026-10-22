"use client";

import { ROLE_LABEL } from "@/lib/constants";
import { useAppStore } from "@/lib/store";
import { cx } from "@/lib/utils";
import type { Role } from "@/types";

const ROLE_ORDER: Role[] = ["student", "staff", "admin"];

/**
 * Demo role switcher. Presentation only: it changes which mock data and
 * actions are visible. It is not authentication and cannot be one; a real
 * backend must enforce permissions independently.
 */
export default function RoleSwitcher() {
  const { role, setRole } = useAppStore();

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-300">Demo role</p>
      <div role="group" aria-label="Switch demo role" className="grid grid-cols-3 gap-1">
        {ROLE_ORDER.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={role === r}
            onClick={() => setRole(r)}
            className={cx(
              "rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
              role === r ? "bg-primary text-white" : "text-slate-200 hover:bg-white/10"
            )}
          >
            {ROLE_LABEL[r]}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[11px] leading-4 text-slate-400">Frontend demo only, not a sign-in.</p>
    </div>
  );
}
