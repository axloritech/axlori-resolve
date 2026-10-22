import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { ReactNode } from "react";

import { cx } from "@/lib/utils";

type Kind = "error" | "success" | "info";

const STYLES: Record<Kind, { classes: string; Icon: typeof Info; iconClass: string }> = {
  error: { classes: "border-red-200 bg-red-50 text-red-800", Icon: AlertTriangle, iconClass: "text-red-700" },
  success: { classes: "border-green-200 bg-green-50 text-green-800", Icon: CheckCircle2, iconClass: "text-green-700" },
  info: { classes: "border-blue-200 bg-blue-50 text-blue-800", Icon: Info, iconClass: "text-blue-700" },
};

/** Consistent feedback banner for auth forms. */
export default function AuthAlert({ kind, children }: { kind: Kind; children: ReactNode }) {
  const { classes, Icon, iconClass } = STYLES[kind];
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={cx("flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm leading-6", classes)}
    >
      <Icon aria-hidden className={cx("mt-0.5 h-4.5 w-4.5 h-[18px] w-[18px] shrink-0", iconClass)} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
