"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center py-16">
      <Card className="max-w-md p-8 text-center">
        <span aria-hidden className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-6 w-6 text-danger" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-ink">Something went wrong</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          This view failed to load. Your demo data is stored in this browser and was not affected.
        </p>
        <Button onClick={reset} className="mt-5">
          <RotateCcw aria-hidden className="h-4 w-4" />
          Try again
        </Button>
      </Card>
    </div>
  );
}
