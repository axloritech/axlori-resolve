import type { Metadata } from "next";

import LegalDocument, { type LegalSection } from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Draft Terms and Conditions for Axlori Resolve, pending legal review.",
};

const SECTIONS: LegalSection[] = [
  {
    id: "purpose",
    heading: "Purpose and intended use",
    body: (
      <>
        <p>
          Axlori Resolve is a campus issue-reporting and resolution platform. It is intended to let students, staff
          and administrators report problems around campus facilities, track their progress, and coordinate a
          response.
        </p>
        <p>
          The platform is a coordination tool. It is not an emergency service and must never be used to report
          emergencies, crimes in progress, or situations requiring immediate assistance. For emergencies, use your
          institution&rsquo;s official emergency channels.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    heading: "Acceptable use",
    body: (
      <>
        <p>When using Axlori Resolve you agree to:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Submit reports that are truthful, relevant to campus, and described to the best of your knowledge.</li>
          <li>Use respectful language in report descriptions and comments.</li>
          <li>Only upload photographs you have the right to share and that document the reported issue.</li>
          <li>Not misrepresent your identity or role on the platform.</li>
        </ul>
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Submit deliberately false, defamatory, harassing, or discriminatory reports or comments.</li>
          <li>Upload content that is unlawful, obscene, or that infringes the rights of others.</li>
          <li>Attempt to access reports or data you are not authorized to view.</li>
          <li>Interfere with the operation of the platform or probe it for vulnerabilities.</li>
        </ul>
      </>
    ),
  },
  {
    id: "responsibilities",
    heading: "User responsibilities",
    body: (
      <>
        <p>
          You are responsible for the accuracy of the reports you submit and for any content you attach or post. You
          are responsible for keeping your account credentials confidential once accounts are introduced, and for all
          activity under your account.
        </p>
        <p>
          Reports should contain enough detail for staff to locate and assess the issue. Deliberately misleading
          detail, or personal information about identifiable individuals that is not necessary for the report, should
          not be included.
        </p>
      </>
    ),
  },
  {
    id: "submissions",
    heading: "Report submissions",
    body: (
      <>
        <p>
          Submitting a report creates a record that may be visible to campus staff and administrators responsible for
          triage and resolution. Submission does not guarantee a response within any particular timeframe; handling
          priorities depend on safety, severity and available resources.
        </p>
        <p>
          Staff may update the status of a report, assign it to colleagues, request clarification in comments, or
          reject it (for example when it is a duplicate, out of scope, or cannot be located). Status updates and
          comments form part of the report record.
        </p>
      </>
    ),
  },
  {
    id: "limitations",
    heading: "Service limitations",
    body: (
      <>
        <p>
          Axlori Resolve is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. No guarantee is
          made that the service will be uninterrupted, error-free, or that every report will receive a response.
          Features may change as the product evolves.
        </p>
        <p>
          The current build is a frontend demonstration: reports, comments, notifications and settings exist only in
          local browser state and are not transmitted to, processed by, or stored on any server. Any behavior in this
          build is illustrative and creates no obligations.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    heading: "Changes to these terms",
    body: (
      <p>
        These terms are a working draft and will change before any production release. A final version must be
        reviewed by qualified legal counsel and adopted by the operating institution before they take effect.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms and Conditions"
      updated="22 October 2026"
      intro={
        <p>
          These draft Terms and Conditions describe the intended rules for using Axlori Resolve. They are written for
          the demonstration build and have <strong className="text-ink">not been reviewed by legal counsel</strong>.
          They do not create a binding agreement, and no legal entity or governing law is specified at this stage.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
