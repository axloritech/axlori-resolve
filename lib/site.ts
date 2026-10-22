/**
 * Centralized application identity and metadata.
 *
 * Custom-domain readiness: every absolute URL in the app is derived from
 * SITE_URL, which reads NEXT_PUBLIC_SITE_URL at build time. Point that env
 * variable at a real domain (e.g. https://resolve.example.edu) when one is
 * supplied; no code changes required. Nothing here claims a domain has been
 * registered or connected.
 */

export const SITE_NAME = "Axlori Resolve";
export const SITE_SHORT_NAME = "Axlori";
export const SITE_DESCRIPTION =
  "Campus issue reporting and resolution platform. Report campus problems, track every resolution. Frontend demonstration build with fictional demo data.";
export const WORKSPACE_NAME = "Campus workspace";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadataBase = new URL(SITE_URL);

/** Human-readable identifier prefix for reports. */
export const REPORT_ID_PREFIX = "AR-";
