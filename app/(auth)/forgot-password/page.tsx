import type { Metadata } from "next";

import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request a password recovery link for Axlori Resolve.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
