import type { Metadata } from "next";
import { Suspense } from "react";

import SignInForm from "@/components/auth/SignInForm";
import Spinner from "@/components/ui/Spinner";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Axlori Resolve.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6" label="Loading sign in" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
