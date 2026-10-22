"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";

import { useAppStore } from "@/lib/store";
import { cx } from "@/lib/utils";
import type { ToastKind } from "@/types";

const KIND_STYLE: Record<ToastKind, { classes: string; Icon: typeof Info }> = {
  success: { classes: "border-green-200 bg-white text-ink", Icon: CheckCircle2 },
  error: { classes: "border-red-200 bg-white text-ink", Icon: XCircle },
  info: { classes: "border-blue-200 bg-white text-ink", Icon: Info },
};

const ICON_COLOR: Record<ToastKind, string> = {
  success: "text-success",
  error: "text-danger",
  info: "text-primary",
};

export default function Toaster() {
  const { toasts, dismissToast } = useAppStore();

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => {
        const { classes, Icon } = KIND_STYLE[t.kind];
        return (
          <div
            key={t.id}
            role="status"
            className={cx(
              "animate-fade-in pointer-events-auto flex w-full max-w-md items-start gap-2.5 rounded-lg border px-4 py-3 shadow-pop",
              classes
            )}
          >
            <Icon aria-hidden className={cx("mt-0.5 h-4 w-4 shrink-0", ICON_COLOR[t.kind])} />
            <p className="min-w-0 flex-1 text-sm leading-5">{t.text}</p>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
              className="rounded p-0.5 text-muted transition-colors hover:bg-page hover:text-ink"
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
