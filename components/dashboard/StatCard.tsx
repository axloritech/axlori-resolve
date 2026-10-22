import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import Card from "@/components/ui/Card";

interface StatCardProps {
  label: string;
  value: string;
  note?: string;
  Icon: LucideIcon;
  href?: string;
}

/** Summary metric card. Icon tile first, then label and large value. */
export default function StatCard({ label, value, note, Icon, href }: StatCardProps) {
  const inner = (
    <>
      <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary-border bg-primary-subtle">
        <Icon className="h-[18px] w-[18px] text-primary" />
      </span>
      <p className="mt-3 text-sm font-medium text-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-ink">{value}</p>
      {note ? <p className="mt-1 text-xs leading-4 text-muted">{note}</p> : null}
    </>
  );

  if (href) {
    return (
      <Card className="p-5 transition-colors hover:border-slate-300">
        <Link href={href} className="block">{inner}</Link>
      </Card>
    );
  }
  return <Card className="p-5">{inner}</Card>;
}
