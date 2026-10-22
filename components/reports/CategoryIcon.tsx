import {
  Droplets,
  Eraser,
  HelpCircle,
  ShieldAlert,
  Wifi,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { cx } from "@/lib/utils";
import type { ReportCategory } from "@/types";

const ICONS: Record<ReportCategory, LucideIcon> = {
  Facilities: Wrench,
  Electricity: Zap,
  Water: Droplets,
  Internet: Wifi,
  Safety: ShieldAlert,
  Cleaning: Eraser,
  Other: HelpCircle,
};

/** Consistent category icon in a bordered tile (color is decorative only). */
export default function CategoryIcon({
  category,
  className,
  iconClassName,
}: {
  category: ReportCategory;
  className?: string;
  iconClassName?: string;
}) {
  const Icon = ICONS[category];
  return (
    <span
      aria-hidden
      title={category}
      className={cx(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary-border bg-primary-subtle",
        className
      )}
    >
      <Icon className={cx("h-4.5 w-4.5 h-[18px] w-[18px] text-primary", iconClassName)} />
    </span>
  );
}
