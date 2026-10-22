"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import { useState } from "react";

import AuthAlert from "@/components/auth/AuthAlert";
import AuthCard from "@/components/auth/AuthCard";
import AuthNotConfigured from "@/components/auth/AuthNotConfigured";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { friendlyAuthError } from "@/lib/auth/errors";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Post-signup verification status page: tells the user to confirm their email
 * and can resend the verification message with a cooldown.
 */
export default function VerifyEmailContent() {
  const configured = isSupabaseConfigured();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!configured) {
    return <AuthNotConfigured action="Email verification" />;
  }

  async function resend() {
    if (sending || cooldown > 0 || !email) return;
    setSending(true);
    setNotice(null);
    setError(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const origin = window.location.origin;
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${origin}/auth/callback` },
      });
      if (resendError) {
        setError(friendlyAuthError(resendError.message));
      } else {
        setNotice(`A new verification email was sent to ${email}.`);
        setCooldown(RESEND_COOLDOWN_SECONDS);
        const timer = window.setInterval(() => {
          setCooldown((c) => {
            if (c <= 1) {
              window.clearInterval(timer);
              return 0;
            }
            return c - 1;
          });
        }, 1000);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <AuthCard title="Verify your email" subtitle="One step left before you can sign in">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-subtle">
            <MailCheck className="h-5 w-5 text-primary" />
          </span>
          <p className="text-sm leading-6 text-muted">
            {email ? (
              <>
                We sent a verification link to <span className="font-medium text-ink">{email}</span>. Open the link in
                that email to confirm your address. Access stays blocked until the address is verified.
              </>
            ) : (
              <>Open the verification link we sent to your email address. Access stays blocked until it is verified.</>
            )}
          </p>
        </div>

        {notice ? <AuthAlert kind="success">{notice}</AuthAlert> : null}
        {error ? <AuthAlert kind="error">{error}</AuthAlert> : null}

        {email ? (
          <Button variant="secondary" full onClick={resend} disabled={sending || cooldown > 0} aria-busy={sending}>
            {sending ? (
              <>
                <Spinner className="h-4 w-4" label="Resending verification email" />
                Resending…
              </>
            ) : cooldown > 0 ? (
              `Resend available in ${cooldown}s`
            ) : (
              "Resend verification email"
            )}
          </Button>
        ) : null}

        <p className="border-t border-line pt-4 text-center text-sm text-muted">
          Verified already?{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
