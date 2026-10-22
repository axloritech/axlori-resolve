"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import AuthAlert from "@/components/auth/AuthAlert";
import AuthCard from "@/components/auth/AuthCard";
import AuthNotConfigured from "@/components/auth/AuthNotConfigured";
import PasswordInput from "@/components/auth/PasswordInput";
import Button from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Field";
import Spinner from "@/components/ui/Spinner";
import { friendlyAuthError } from "@/lib/auth/errors";
import { signUpSchema, type SignUpValues } from "@/lib/auth/validation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

/**
 * Create Account form. New accounts always receive the default "student"
 * role: the profile trigger in supabase/schema.sql hard-codes it, and client
 * input can never select a role.
 */
export default function SignUpForm() {
  const configured = isSupabaseConfigured();

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", acceptTerms: false },
  });

  const emailValue = watch("email");

  if (!configured) {
    return <AuthNotConfigured action="Creating an account" />;
  }

  async function onSubmit(values: SignUpValues) {
    if (submitting) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signUp({
        email: values.email.trim().toLowerCase(),
        password: values.password,
        options: {
          data: { full_name: values.fullName.trim() },
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });
      if (error) {
        setFormError(friendlyAuthError(error.message));
        return;
      }
      setSuccessEmail(values.email.trim().toLowerCase());
    } catch {
      setFormError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (successEmail) {
    return (
      <AuthCard title="Check your inbox" subtitle="Verify your email to finish creating your account">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50">
              <MailCheck className="h-5 w-5 text-success" />
            </span>
            <p className="text-sm leading-6 text-muted">
              We sent a verification link to <span className="font-medium text-ink">{successEmail}</span>. Open it to
              confirm your address. You can sign in only after the email is verified.
            </p>
          </div>
          <div className="flex flex-col gap-2 border-t border-line pt-4">
            <Link href={`/verify-email?email=${encodeURIComponent(successEmail)}`}>
              <Button variant="secondary" full>
                Open verification page
              </Button>
            </Link>
            <p className="text-center text-sm text-muted">
              Already verified?{" "}
              <Link href="/login" className="font-medium text-primary underline-offset-2 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create account" subtitle="New accounts always start with the student role">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {formError ? <AuthAlert kind="error">{formError}</AuthAlert> : null}

        <FormField label="Full name" htmlFor="fullName" required error={errors.fullName?.message}>
          <Input
            id="fullName"
            autoComplete="name"
            placeholder="e.g. Jomel Adewale"
            aria-invalid={!!errors.fullName}
            {...register("fullName")}
          />
        </FormField>

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

        <FormField
          label="Password"
          htmlFor="password"
          required
          hint="At least 8 characters with upper and lowercase letters and a number."
          error={errors.password?.message}
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </FormField>

        <FormField label="Confirm password" htmlFor="confirmPassword" required error={errors.confirmPassword?.message}>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </FormField>

        <div>
          <div className="flex items-start gap-2.5">
            <input
              id="acceptTerms"
              type="checkbox"
              aria-invalid={!!errors.acceptTerms}
              aria-describedby={errors.acceptTerms ? "acceptTerms-error" : undefined}
              className="mt-0.5 h-4 w-4 rounded border-line text-primary accent-primary focus:ring-primary"
              {...register("acceptTerms")}
            />
            <label htmlFor="acceptTerms" className="text-sm leading-6 text-muted">
              I agree to the{" "}
              <Link href="/terms" className="font-medium text-primary underline-offset-2 hover:underline">
                Terms and Conditions
              </Link>{" "}
              and the{" "}
              <Link href="/privacy" className="font-medium text-primary underline-offset-2 hover:underline">
                Privacy Policy
              </Link>
              .
            </label>
          </div>
          {errors.acceptTerms?.message ? (
            <p id="acceptTerms-error" role="alert" className="mt-1.5 text-xs font-medium text-danger">
              {errors.acceptTerms.message}
            </p>
          ) : null}
        </div>

        <Button type="submit" size="lg" full disabled={submitting} aria-busy={submitting}>
          {submitting ? (
            <>
              <Spinner className="h-4 w-4" label="Creating account" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>

        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
