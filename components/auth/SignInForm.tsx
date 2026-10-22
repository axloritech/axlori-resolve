"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import AuthAlert from "@/components/auth/AuthAlert";
import AuthCard from "@/components/auth/AuthCard";
import AuthNotConfigured from "@/components/auth/AuthNotConfigured";
import PasswordInput from "@/components/auth/PasswordInput";
import { setRememberPreference } from "@/components/auth/SessionPolicy";
import Button from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Field";
import Spinner from "@/components/ui/Spinner";
import { friendlyAuthError } from "@/lib/auth/errors";
import { signInSchema, type SignInValues } from "@/lib/auth/validation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const CALLBACK_ERROR =
  "The sign-in or verification link expired or was already used. Request a new one and try again.";

export default function SignInForm() {
  const configured = isSupabaseConfigured();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const callbackFailed = searchParams.get("error") === "callback";
  const verified = searchParams.get("verified") === "1";

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(callbackFailed ? CALLBACK_ERROR : null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  if (!configured) {
    return <AuthNotConfigured action="Signing in" />;
  }

  async function onSubmit(values: SignInValues) {
    if (submitting) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          router.push(`/verify-email?email=${encodeURIComponent(values.email.trim().toLowerCase())}`);
          return;
        }
        setFormError(friendlyAuthError(error.message));
        return;
      }
      setRememberPreference(values.remember);
      const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
      router.push(target);
      router.refresh();
    } catch {
      setFormError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Sign in" subtitle="Access your campus reports and assignments">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {verified ? <AuthAlert kind="success">Email verified. You can sign in now.</AuthAlert> : null}
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

        <FormField label="Password" htmlFor="password" required error={errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </FormField>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 rounded border-line accent-primary focus:ring-primary"
              {...register("remember")}
            />
            <label htmlFor="remember" className="text-sm text-muted">
              Keep me signed in on this device
            </label>
          </div>
          <Link href="/forgot-password" className="text-sm font-medium text-primary underline-offset-2 hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" full disabled={submitting} aria-busy={submitting}>
          {submitting ? (
            <>
              <Spinner className="h-4 w-4" label="Signing in" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>

        <p className="text-center text-sm text-muted">
          No account yet?{" "}
          <Link href="/signup" className="font-medium text-primary underline-offset-2 hover:underline">
            Create account
          </Link>
        </p>

        <p className="border-t border-line pt-4 text-center text-xs leading-5 text-muted">
          Just looking around?{" "}
          <Link href="/demo/start" className="font-medium text-primary underline-offset-2 hover:underline">
            Continue to the demo without an account
          </Link>
          . Demo access never grants real privileges.
        </p>
      </form>
    </AuthCard>
  );
}
