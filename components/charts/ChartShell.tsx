"use client";

import { useEffect, useState, type ReactNode } from "react";

import Card, { CardHeader } from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";

interface ChartShellProps {
  title: string;
  subtitle?: string;
  /** Text alternative describing the chart for assistive technology. */
  a11ySummary: string;
  /** Fixed pixel height for the responsive chart area. */
  height?: number;
  action?: ReactNode;
  children: ReactNode;
}

/**
 * Card wrapper for charts. Charts render only after mount: Recharts measures
 * its container at runtime, so server-rendering an interactive chart would
 * produce size=0 output and hydration noise.
 */
export default function ChartShell({ title, subtitle, a11ySummary, height = 280, action, children }: ChartShellProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} action={action} />
      <div role="img" aria-label={a11ySummary} className="px-3 py-4 sm:px-4">
        {mounted ? (
          <div style={{ height }}>{children}</div>
        ) : (
          <div style={{ height }} className="flex items-center justify-center">
            <Spinner label={`Loading ${title}`} />
          </div>
        )}
      </div>
    </Card>
  );
}
