import { Link } from "@tanstack/react-router";

import { CoachFacePageShell } from "@/components/coachface-page-shell";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

const legalLinks = [
  { to: "/terms", label: "Terms of Service" },
  { to: "/game-rules", label: "Game Rules" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/fair-play", label: "Fair Play Policy" },
] as const;

export function LegalDocument({
  eyebrow,
  title,
  summary,
  sections,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  sections: LegalSection[];
}) {
  return (
    <CoachFacePageShell>
      <header className="border-b border-border bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-4 max-w-5xl font-display text-5xl font-black uppercase leading-[0.92] tracking-tight sm:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-game-muted">{summary}</p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold">
            <span>Effective June 14, 2026</span>
            <span className="text-game-muted">Last updated June 14, 2026</span>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-12 px-5 py-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8 lg:py-16">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="eyebrow">Legal center</p>
          <nav className="mt-4 border-y border-border" aria-label="Legal documents">
            {legalLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block border-b border-border py-3 text-sm font-bold text-muted-foreground transition-colors last:border-b-0 hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
            Questions may be submitted through CoachFace support. These policies should be reviewed
            by qualified counsel before paid contests or withdrawals launch.
          </p>
        </aside>

        <article className="min-w-0">
          <div className="border-l-4 border-primary bg-secondary p-5 text-sm leading-relaxed">
            This document forms part of the agreement between you and CoachFace, developed and
            operated by SCOSTrade. Please read it carefully and keep a copy for your records.
          </div>
          <div className="mt-10 space-y-12">
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <p className="font-mono text-xs font-bold text-primary">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-2 font-display text-3xl font-black uppercase tracking-tight sm:text-4xl">
                  {section.title}
                </h2>
                <div className="mt-5 space-y-4 text-base leading-7 text-muted-foreground">
                  {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.bullets && (
                    <ul className="space-y-3 border-l border-border pl-5">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>
    </CoachFacePageShell>
  );
}