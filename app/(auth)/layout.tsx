import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Minimal chrome for authentication pages: brand, centered card, legal links.
 * Deliberately separate from the application shell in (app).
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Axlori Resolve home">
            <svg aria-hidden viewBox="0 0 64 64" className="h-8 w-8">
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
            <span className="text-sm font-semibold text-ink">Axlori Resolve</span>
          </Link>
          <Link
            href="/demo/start"
            className="rounded-lg border border-line bg-card px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-page"
          >
            Explore the demo
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      <footer className="border-t border-line bg-card">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-muted sm:px-6">
          <p>Campus issue reporting and resolution, demo build.</p>
          <p className="flex gap-4">
            <Link href="/terms" className="underline-offset-2 hover:text-ink hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="underline-offset-2 hover:text-ink hover:underline">
              Privacy
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
