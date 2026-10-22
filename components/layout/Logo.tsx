import { WORKSPACE_NAME } from "@/lib/site";

/** Axlori Resolve brand mark used in the sidebar. */
export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <svg aria-hidden viewBox="0 0 64 64" className="h-9 w-9 shrink-0">
        <rect width="64" height="64" rx="14" fill="#2563EB" />
        <path
          d="M18 33.5 28 43 47 22"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-semibold text-white">Axlori</p>
        <p className="truncate text-sm text-slate-300">Resolve</p>
      </div>
      <span className="sr-only">{WORKSPACE_NAME}</span>
    </div>
  );
}
