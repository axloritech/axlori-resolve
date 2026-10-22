import type { Metadata } from "next";

import LegalDocument, { type LegalSection } from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Draft Privacy Policy for Axlori Resolve, pending legal review.",
};

const SECTIONS: LegalSection[] = [
  {
    id: "current-build",
    heading: "What the current build does with data",
    body: (
      <>
        <p>
          This is a frontend demonstration build. There is no backend and nothing you type is transmitted to a
          server. Reports, comments, role selection and settings are stored in your browser&rsquo;s localStorage on
          your own device; images you attach are read locally and never uploaded. Clearing your browser storage
          removes this data.
        </p>
        <p>
          The sections below describe how a production deployment is <em>intended</em> to handle data. They are
          design intentions, not descriptions of systems that exist yet. No claims are made here about encryption,
          hosting, certifications, or jurisdictions, because none have been implemented or assessed.
        </p>
      </>
    ),
  },
  {
    id: "account",
    heading: "Account details",
    body: (
      <>
        <p>
          A production version would require an account containing a name and an institutional email address to
          submit and track reports. Authentication and account management would be provided by the platform&rsquo;s
          backend provider, and account details would be used to identify you to staff handling your reports.
        </p>
      </>
    ),
  },
  {
    id: "reports",
    heading: "Reports and descriptions",
    body: (
      <>
        <p>
          Reports include a title, description, category, location, priority and timestamps. Their operational
          purpose is to help staff locate and resolve issues, so the content of a report would be visible to the
          staff and administrators with a role in triage and resolution.
        </p>
        <p>
          Users should avoid including unnecessary personal information about themselves or others in report text.
          Aggregated statistics derived from reports (such as counts by category or location) may be shown on
          dashboards; these aggregates are intended to be used for service improvement.
        </p>
      </>
    ),
  },
  {
    id: "photos",
    heading: "Uploaded photographs",
    body: (
      <>
        <p>
          Photos attached to reports are intended to document the reported issue. In a production deployment they
          would be stored with the report and visible to staff handling it. Photos should not contain people who
          could be identified, or anything outside the scope of the issue, where this can reasonably be avoided.
        </p>
        <p>
          In the current demo build, attached photos never leave your browser.
        </p>
      </>
    ),
  },
  {
    id: "comments",
    heading: "Comments",
    body: (
      <p>
        Comments on a report would be visible to the people following that report, typically the reporter and the
        staff involved, and would carry the author&rsquo;s display name and role. They are intended for coordinating
        resolution and are covered by the same acceptable-use rules as reports.
      </p>
    ),
  },
  {
    id: "notifications",
    heading: "Notifications",
    body: (
      <p>
        A production version could send in-app or email notifications about status changes, assignments and comments
        you follow, subject to the preferences you set. Notification preferences would be stored with your account.
        The current build sends no notifications; the bell menu shows locally generated demo items.
      </p>
    ),
  },
  {
    id: "access",
    heading: "Data access and retention",
    body: (
      <>
        <p>
          Access to report data in production is intended to be role-based: reporters can see their own reports,
          staff can see the campus queue, and administrators can manage the workspace. Enforcing these rules is the
          responsibility of the backend and cannot be delegated to the browser.
        </p>
        <p>
          Retention periods (for example, how long resolved reports and their photos are kept) have not been decided
          and will be defined during a legal and institutional review before any production launch. This draft
          deliberately makes no retention promises.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    heading: "Questions about this policy",
    body: (
      <p>
        No privacy contact, data officer, or legal entity has been appointed for this demonstration project, so
        none is listed. A production release must name the responsible institution and a contact channel before
        collecting any personal data.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      updated="22 October 2026"
      intro={
        <p>
          This draft Privacy Policy explains how Axlori Resolve is intended to handle personal data, and what the
          current demonstration build actually does. It has <strong className="text-ink">not been reviewed by legal
          counsel</strong> and must be reviewed, completed, and adopted before any production use.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
