import type { Metadata } from "next";
import { Suspense } from "react";

import ReportsExplorer from "@/components/reports/ReportsExplorer";
import Spinner from "@/components/ui/Spinner";

export const metadata: Metadata = {
  title: "Reports",
  description: "Browse, search, filter and sort campus issue reports. Frontend demo data.",
};

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Spinner className="h-6 w-6" label="Loading reports" />
        </div>
      }
    >
      <ReportsExplorer />
    </Suspense>
  );
}
