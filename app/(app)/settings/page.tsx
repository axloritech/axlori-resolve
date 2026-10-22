"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, ShieldCheck } from "lucide-react";

import Button from "@/components/ui/Button";
import Card, { CardHeader } from "@/components/ui/Card";
import DemoNote from "@/components/ui/DemoNote";
import { FormField, Input, Toggle } from "@/components/ui/Field";
import { ROLE_LABEL } from "@/lib/constants";
import { WORKSPACE_NAME } from "@/lib/site";
import { useAppStore } from "@/lib/store";
import type { UserSettings } from "@/types";

export default function SettingsPage() {
  const { settings, saveSettings, currentUser } = useAppStore();

  // Local drafts so the Save action is deliberate and testable.
  const [profile, setProfile] = useState({ displayName: settings.displayName, email: settings.email });
  const [display, setDisplay] = useState({ compactTables: settings.compactTables, reduceMotion: settings.reduceMotion });
  const [notifs, setNotifs] = useState({
    notifyStatusUpdates: settings.notifyStatusUpdates,
    notifyComments: settings.notifyComments,
    notifyAssignments: settings.notifyAssignments,
    weeklyDigest: settings.weeklyDigest,
  });
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    setProfile({ displayName: settings.displayName, email: settings.email });
    setDisplay({ compactTables: settings.compactTables, reduceMotion: settings.reduceMotion });
    setNotifs({
      notifyStatusUpdates: settings.notifyStatusUpdates,
      notifyComments: settings.notifyComments,
      notifyAssignments: settings.notifyAssignments,
      weeklyDigest: settings.weeklyDigest,
    });
  }, [settings]);

  function saveProfile() {
    const name = profile.displayName.trim();
    if (name.length < 2) {
      setProfileError("Enter a display name of at least 2 characters.");
      return;
    }
    setProfileError(null);
    saveSettings({ displayName: name, email: profile.email.trim() });
  }

  function sectionSave(patch: Partial<UserSettings>) {
    saveSettings(patch);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-ink">Settings</h2>
        <p className="mt-1 text-sm text-muted">Preferences for this demo workspace.</p>
      </div>

      <DemoNote>
        Settings on this page are stored in this browser only (localStorage) and reset when storage is cleared. They
        simulate persistent account preferences but are not connected to any backend.
      </DemoNote>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader title="User profile" subtitle={`Active demo persona: ${ROLE_LABEL[currentUser.role]}`} />
          <div className="space-y-4 px-5 py-4">
            <FormField label="Display name" htmlFor="displayName" error={profileError ?? undefined}>
              <Input
                id="displayName"
                value={profile.displayName}
                onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))}
                aria-invalid={!!profileError}
              />
            </FormField>
            <FormField label="Email" htmlFor="email" hint="Demo address. Verification is a backend feature.">
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              />
            </FormField>
            <div className="flex justify-end border-t border-line pt-4">
              <Button onClick={saveProfile}>Save profile</Button>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Display preferences" subtitle="Apply immediately across this demo" />
          <div className="divide-y divide-line px-5 py-2">
            <Toggle
              id="compact-tables"
              checked={display.compactTables}
              onChange={(v) => setDisplay((d) => ({ ...d, compactTables: v }))}
              label="Compact tables"
              description="Use tighter row spacing in data tables."
            />
            <Toggle
              id="reduce-motion"
              checked={display.reduceMotion}
              onChange={(v) => setDisplay((d) => ({ ...d, reduceMotion: v }))}
              label="Reduce interface motion"
              description="Minimizes animations and transitions. System reduced-motion settings are always respected."
            />
          </div>
          <div className="flex justify-end border-t border-line px-5 py-4">
            <Button onClick={() => sectionSave(display)}>Save display preferences</Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Notification preferences" subtitle="Simulated, no notifications are sent" />
          <div className="divide-y divide-line px-5 py-2">
            <Toggle
              id="n-status"
              checked={notifs.notifyStatusUpdates}
              onChange={(v) => setNotifs((n) => ({ ...n, notifyStatusUpdates: v }))}
              label="Status updates"
              description="When a report you follow changes status."
            />
            <Toggle
              id="n-comments"
              checked={notifs.notifyComments}
              onChange={(v) => setNotifs((n) => ({ ...n, notifyComments: v }))}
              label="Comments"
              description="When someone comments on your report."
            />
            <Toggle
              id="n-assign"
              checked={notifs.notifyAssignments}
              onChange={(v) => setNotifs((n) => ({ ...n, notifyAssignments: v }))}
              label="Assignments"
              description="When staff are assigned to a report (staff view)."
            />
            <Toggle
              id="n-digest"
              checked={notifs.weeklyDigest}
              onChange={(v) => setNotifs((n) => ({ ...n, weeklyDigest: v }))}
              label="Weekly digest"
              description="A weekly summary email. Demo toggle only."
            />
          </div>
          <div className="flex justify-end border-t border-line px-5 py-4">
            <Button onClick={() => sectionSave(notifs)}>Save notification preferences</Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Workspace information" subtitle="Read-only in this demo" />
          <div className="space-y-3 px-5 py-4 text-sm">
            <div className="flex items-start gap-3 rounded-lg border border-line bg-page/60 px-3 py-3">
              <Building2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
              <div>
                <p className="font-medium text-ink">{WORKSPACE_NAME}</p>
                <p className="mt-0.5 text-xs leading-5 text-muted">
                  Riverside Demo Campus (fictional). 8 demo staff members. Workspace management, custom domains and
                  real memberships are backend features outside this phase.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-line bg-page/60 px-3 py-3">
              <ShieldCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
              <div>
                <p className="font-medium text-ink">Legal documents</p>
                <p className="mt-0.5 text-xs leading-5 text-muted">
                  Draft documents pending legal review:{" "}
                  <Link href="/terms" className="text-primary underline-offset-2 hover:underline">
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary underline-offset-2 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
