"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import AuthAlert from "@/components/auth/AuthAlert";
import AuthCard from "@/components/auth/AuthCard";
import AuthNotConfigured from "@/components/auth/AuthNotConfigured";
import PasswordInput from "@/components/auth/PasswordInput";
import Button from "@/components/ui/Button";
import { FormField } from "@/components/ui/Field";
import Spinner from "@/components/ui/Spinner";
import { friendlyAuthError } from "@/lib/auth/errors";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/auth/validation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type LinkState = "checking" | "valid" | "invalid";

/**
 * Requires a valid recovery session (created by /auth/callback exchanging the
 * emailed code). Without one, the form is not offered.
 */
export default function ResetPasswordForm() {
  const configured = isSupabaseConfigured();
  const router = useRouter();

  const [linkState, setLinkState] = useState<LinkState>("checking");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    const supabase = createBrowserSupabaseClient();

    // Recovery links land here after /auth/callback created a session.
    // Also listen for the PASSWORD_RECOVERY event for hash-based flows.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && !cancelled) setLinkState("valid");
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setLinkState(data.session ? "valid" : "invalid");
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [configured]);

  if (!configured) {
    return <AuthNotConfigured action="Resetting a password" />;
  }

  async function onSubmit(values: ResetPasswordValues) {
    if (submitting) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.updateUser({ password: values.password });
      if (error) {
        setFormError(friendlyAuthError(error.message));
        return;
      }
      setDone(true);
    } catch {
      setFormError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (linkState === "checking") {
    return (
      <AuthCard title="Reset password">
        <div className="flex items-center justify-center gap-3 py-8 text-sm text-muted">
          <Spinner className="h-5 w-5" label="Validating recovery link" />
          Validating your recovery link…
        </div>
      </AuthCard>
    );
  }

  if (linkState === "invalid") {
    return (
      <AuthCard title="Reset password" subtitle="This link is no longer usable">
        <div className="space-y-4">
          <AuthAlert kind="error">
            The recovery link is invalid, expired, or already used. Request a new link to continue.
          </AuthAlert>
          <Link href="/forgot-password" className="block">
            <Button variant="primary" full>
              Request a new recovery link
            </Button>
          </Link>
          <p className="text-center text-sm text-muted">
            <Link href="/login" className="font-medium text-primary underline-offset-2 hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard title="Password updated" subtitle="You can keep using Axlori Resolve right away">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50">
              <KeyRound className="h-5 w-5 text-success" />
            </span>
            <p className="text-sm leading-6 text-muted">
              Your password was changed. Use it next time you sign in on this or any other device.
            </p>
          </div>
          <Button
            full
            onClick={() => {
              router.push("/");
              router.refresh();
            }}
          >
            Continue to overview
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password" subtitle="Your recovery link was verified">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {formError ? <AuthAlert kind="error">{formError}</AuthAlert> : null}

        <FormField
          label="New password"
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

        <FormField label="Confirm new password" htmlFor="confirmPassword" required error={errors.confirmPassword?.message}>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </FormField>

        <Button type="submit" size="lg" full disabled={submitting} aria-busy={submitting}>
          {submitting ? (
            <>
              <Spinner className="h-4 w-4" label="Saving password" />
              Saving new password…
            </>
          ) : (
            "Save new password"
          )}
        </Button>
      </form>
    </AuthCard>
  );
}
