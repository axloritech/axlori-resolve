import { DEMO_NOW } from "@/lib/constants";

/** Classname join helper (no external dependency). */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

// Formatters pin timeZone to UTC so server and client render identical text
// for the UTC-anchored demo dataset (avoids hydration mismatches).
const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const DATETIME_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

export function formatDate(iso: string): string {
  return DATE_FMT.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return DATETIME_FMT.format(new Date(iso));
}

/**
 * Human-readable relative time against the fixed demo anchor (DEMO_NOW),
 * e.g. "2 days ago". Deterministic for the demo dataset.
 */
export function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = DEMO_NOW.getTime() - then;
  const abs = Math.abs(diffMs);
  const minutes = Math.round(abs / 60000);
  const hours = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);

  let value: string;
  if (minutes < 60) value = `${Math.max(minutes, 1)} min`;
  else if (hours < 24) value = `${hours} hr`;
  else if (days < 7) value = `${days} day${days === 1 ? "" : "s"}`;
  else if (days < 30) {
    const w = Math.round(days / 7);
    value = `${w} week${w === 1 ? "" : "s"}`;
  } else {
    const m = Math.round(days / 30);
    value = `${m} month${m === 1 ? "" : "s"}`;
  }
  return diffMs >= 0 ? `${value} ago` : `in ${value}`;
}

export function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function greetingForDemoTime(): string {
  const hour = DEMO_NOW.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function firstNameOf(name: string): string {
  return name.split(" ")[0] ?? name;
}

/** Deterministic pseudo-random generator (mulberry32) for stable mock data. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : plural ?? `${singular}s`;
}
