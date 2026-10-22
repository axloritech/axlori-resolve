"use client";

import { Lock } from "lucide-react";
import type { ReactNode } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { ROLE_LABEL } from "@/lib/constants";
import { useAppStore } from "@/lib/store";
import type { Role } from "@/types";

/**
 * Presentation-level visibility gate, marked clearly as a demo convenience,
 * not access control. Real authorization belongs to the future backend.
 */
export default function RoleGate({
  allow,
  feature,
  children,
}: {
  allow: Role[];
  feature: string;
  children: ReactNode;
}) {
  const { role, setRole } = useAppStore();

  if (allow.includes(role)) return <>{children}</>;

  const fallbackRole = allow[0];
  return (
    <Card className="mx-auto max-w-lg p-8 text-center">
      <span aria-hidden className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-page">
        <Lock className="h-6 w-6 text-muted" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-ink">{feature} is designed for {ROLE_LABEL[fallbackRole].toLowerCase()} workflows</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        The {ROLE_LABEL[role]} demo role keeps {feature.toLowerCase()} hidden, mirroring how production permissions
        would scope this view. This gate is a visual aid only, never a security control: real access rules must be
        enforced by the backend.
      </p>
      <Button className="mt-5" onClick={() => setRole(fallbackRole)}>
        Switch to the {ROLE_LABEL[fallbackRole]} demo role
      </Button>
    </Card>
  );
}
