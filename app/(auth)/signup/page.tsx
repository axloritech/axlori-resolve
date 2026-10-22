import type { Metadata } from "next";

import SignUpForm from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create an Axlori Resolve account. New accounts start with the student role by default.",
};

export default function SignUpPage() {
  return <SignUpForm />;
}
