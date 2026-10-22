import Link from "next/link";
import { Compass } from "lucide-react";

import { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center py-16">
      <Card className="max-w-md p-8 text-center">
        <span aria-hidden className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-page">
          <Compass className="h-6 w-6 text-muted" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-ink">Page not found</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <Link href="/" className={buttonClasses("primary", "md")}>
            Go to overview
          </Link>
          <Link href="/reports" className={buttonClasses("secondary", "md")}>
            Browse reports
          </Link>
        </div>
      </Card>
    </div>
  );
}
