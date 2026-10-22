"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import AuthAlert from "@/components/auth/AuthAlert";
import AuthCard from "@/components/auth/AuthCard";
import AuthNotConfigured from "@/components/auth/AuthNotConfigured";
import Button from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Field";
import Spinner from "@/components/ui/Spinner";
import { friendlyAuthError } from "@/lib/auth/errors";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/auth/validation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

/**
 * Recovery request. Uses Supabase's recovery email flow; no passwords are
 * ever collected or stored by the application itself. The success message is
 * neutral on purpose so it cannot be used to probe which emails exist.
 */
export default function ForgotPasswordForm() {
  const configured = isSupabaseConfigured();

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  if (!configured) {
    return <AuthNotConfigured action="Password recovery" />;
  }

  async function onSubmit(values: ForgotPasswordValues) {
    if (submitting) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(values.email.trim().toLowerCase(), {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      });
      if (error) {
        setFormError(friendlyAuthError(error.message));
        return;
      }
      setSentTo(values.email.trim().toLowerCase());
    } catch {
      setFormError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sentTo) {
    return (
      <AuthCard title="Check your inbox" subtitle="Recovery link requested">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50">
              <MailCheck className="h-5 w-5 text-success" />
            </span>
            <p className="text-sm leading-6 text-muted">
              If an account exists for <span className="font-medium text-ink">{sentTo}</span>, a recovery link is on its
              way. It expires for security, so use it soon.
            </p>
          </div>
          <Link href="/login" className="block border-t border-line pt-4">
            <Button variant="secondary" full>
              <ArrowLeft aria-hidden className="h-4 w-4" />
              Back to sign in
            </Button>
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Forgot password" subtitle="We will email you a recovery link">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {formError ? <AuthAlert kind="error">{formError}</AuthAlert> : null}

        <FormField label="Email address" htmlFor="email" required error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </FormField>

        <Button type="submit" size="lg" full disabled={submitting} aria-busy={submitting}>
          {submitting ? (
            <>
              <Spinner className="h-4 w-4" label="Sending recovery email" />
              Sending recovery email…
            </>
          ) : (
            "Send recovery link"
          )}
        </Button>

        <p className="text-center text-sm text-muted">
          Remembered it after all?{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-2 hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
