import Card, { CardHeader } from "@/components/ui/Card";
import type { ReactNode } from "react";

/** Presentational wrapper for an auth form panel. */
export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader title={title} subtitle={subtitle} />
      <div className="px-5 py-5">{children}</div>
    </Card>
  );
}
