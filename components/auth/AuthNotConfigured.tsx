import Link from "next/link";
import { Wrench } from "lucide-react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

/**
 * Shown on auth pages while NEXT_PUBLIC_SUPABASE_URL / ANON_KEY are unset.
 * Authentication is honestly marked as unavailable instead of pretending forms
 * work against a backend that does not exist yet.
 */
export default function AuthNotConfigured({ action }: { action: string }) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-3">
        <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50">
          <Wrench className="h-5 w-5 text-warning" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">Authentication is not configured yet</p>
          <p className="mt-1 text-sm leading-6 text-muted">
            {action} requires a live Supabase project. The forms are built and validated, but sign-in stays disabled
            until <span className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</span> and{" "}
            <span className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</span> are set and the database schema
            is applied. Nothing about authentication is faked in the meantime.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/demo/start">
              <Button variant="primary" size="sm">
                Continue to the demo
              </Button>
            </Link>
            <Link href="/terms">
              <Button variant="ghost" size="sm">
                Read the Terms
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
