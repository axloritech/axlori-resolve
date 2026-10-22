import type { Metadata } from "next";

import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password after verifying a recovery link.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
