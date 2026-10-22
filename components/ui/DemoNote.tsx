import { Info } from "lucide-react";
import type { ReactNode } from "react";

import { cx } from "@/lib/utils";

/**
 * Small inline disclosure used wherever demo behaviour must not be confused
 * with real backend functionality.
 */
export default function DemoNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cx(
        "flex items-start gap-2 rounded-lg border border-primary-border bg-primary-subtle px-3 py-2 text-xs leading-5 text-navy-800",
        className
      )}
    >
      <Info aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
