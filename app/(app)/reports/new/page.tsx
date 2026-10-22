import type { Metadata } from "next";

import ReportForm from "@/components/forms/ReportForm";

export const metadata: Metadata = {
  title: "Report an issue",
  description: "Submit a campus issue report. Validated locally and stored in frontend demo state.",
};

export default function NewReportPage() {
  return <ReportForm />;
}
