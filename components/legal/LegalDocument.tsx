import { FileWarning } from "lucide-react";
import type { ReactNode } from "react";

import Card from "@/components/ui/Card";
import { LEGAL_REVIEW_NOTE } from "@/lib/constants";

export interface LegalSection {
  id: string;
  heading: string;
  body: ReactNode;
}

export default function LegalDocument({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-muted">Last updated: {updated} (working draft)</p>
      </div>

      <div
        role="status"
        className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900"
      >
        <FileWarning aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />
        <p>{LEGAL_REVIEW_NOTE}</p>
      </div>

      <Card className="p-5 sm:p-8">
        <div className="text-sm leading-6 text-muted">{intro}</div>

        <nav aria-label="Document contents" className="mt-6 rounded-lg border border-line bg-page/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Contents</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-primary underline-offset-2 hover:underline">
                  {s.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-8 space-y-8">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-heading`} className="scroll-mt-24">
              <h3 id={`${s.id}-heading`} className="text-base font-semibold text-ink">
                {i + 1}. {s.heading}
              </h3>
              <div className="mt-2 space-y-3 text-sm leading-6 text-muted">{s.body}</div>
            </section>
          ))}
        </div>
      </Card>
    </div>
  );
}
