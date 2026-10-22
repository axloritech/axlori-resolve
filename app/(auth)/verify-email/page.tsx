import type { Metadata } from "next";
import { Suspense } from "react";

import VerifyEmailContent from "@/components/auth/VerifyEmailContent";
import Spinner from "@/components/ui/Spinner";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Verify your email address to activate your Axlori Resolve account.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6" label="Loading verification" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
