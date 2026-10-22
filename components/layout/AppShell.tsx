"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Info, X } from "lucide-react";

import SidebarContent from "@/components/layout/SidebarContent";
import Topbar from "@/components/layout/Topbar";
import { DEMO_AUTH, type AuthContextInfo } from "@/components/layout/auth-context";
import Toaster from "@/components/ui/Toaster";
import { useAppStore } from "@/lib/store";
import { cx } from "@/lib/utils";

/**
 * Application shell: persistent desktop sidebar, accessible mobile drawer,
 * top navigation bar, content column and toast host. `auth` comes resolved
 * from the server layout in app/(app)/layout.tsx.
 */
export default function AppShell({ children, auth = DEMO_AUTH }: { children: ReactNode; auth?: AuthContextInfo }) {
  const pathname = usePathname();
  const { settings } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Apply the "reduce interface motion" display preference globally.
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", settings.reduceMotion);
    return () => document.documentElement.classList.remove("reduce-motion");
  }, [settings.reduceMotion]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const showBanner = !bannerDismissed && !auth.live && (auth.configured ? auth.demoBanner : true);
  const bannerText = auth.configured
    ? "You are browsing the demo. Content is fictional and demo access grants no real privileges. Sign in to use a real account."
    : "Demo build: authentication is not configured yet, so everything here is fictional and stored only in your browser.";

  return (
    <div className={cx(settings.compactTables && "density-compact")}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[250px] lg:block">
        <SidebarContent auth={auth} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileOpen(false)}
            className="animate-fade-in absolute inset-0 cursor-default bg-ink/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="animate-slide-in absolute inset-y-0 left-0 w-[280px] max-w-[85vw] shadow-pop"
          >
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 z-10 rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X aria-hidden className="h-5 w-5" />
            </button>
            <SidebarContent auth={auth} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-h-screen flex-col lg:pl-[250px]">
        <Topbar auth={auth} onOpenNav={() => setMobileOpen(true)} />
        {showBanner ? (
          <div role="status" className="border-b border-primary-border bg-primary-subtle">
            <div className="mx-auto flex w-full max-w-shell items-start gap-2.5 px-4 py-2.5 sm:px-6 lg:px-8">
              <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="flex-1 text-xs leading-5 text-navy-800">{bannerText}</p>
              {!auth.live && auth.configured ? (
                <Link href="/demo/exit" className="shrink-0 text-xs font-medium text-primary underline-offset-2 hover:underline">
                  Leave demo
                </Link>
              ) : null}
              <button
                type="button"
                aria-label="Dismiss banner"
                onClick={() => setBannerDismissed(true)}
                className="rounded p-0.5 text-navy-800 transition-colors hover:bg-white/60"
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
        <main id="main-content" className="flex-1">
          <div className="mx-auto w-full max-w-shell px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
        <footer className="border-t border-line bg-card">
          <div className="mx-auto flex w-full max-w-shell flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-muted sm:px-6 lg:px-8">
            <p>Axlori Resolve, frontend demonstration build. All data is fictional.</p>
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

      <Toaster />
    </div>
  );
}
