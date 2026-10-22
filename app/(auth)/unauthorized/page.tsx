import type { Metadata } from "next";
import Link from "next/link";
import { ShieldX } from "lucide-react";

import { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Access denied",
  description: "You do not have permission to access this area.",
};

export default function UnauthorizedPage() {
  return (
    <Card className="p-8 text-center">
      <span aria-hidden className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
        <ShieldX className="h-6 w-6 text-danger" />
      </span>
      <h1 className="mt-4 text-xl font-semibold tracking-tight text-ink">Access denied</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Your account does not have permission to open this area. Permissions are checked on the server, not just in the
        interface, so if you believe this is a mistake, contact a workspace administrator. Changing the demo role
        switcher can never grant access.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
        <Link href="/" className={buttonClasses("primary", "md")}>
          Go to overview
        </Link>
        <Link href="/login" className={buttonClasses("secondary", "md")}>
          Sign in with another account
        </Link>
      </div>
    </Card>
  );
}
