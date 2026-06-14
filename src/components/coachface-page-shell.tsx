import { useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/profile", label: "Profile" },
  { to: "/security", label: "Security" },
  { to: "/fifa-special", label: "FIFA Special" },
  { to: "/rankings", label: "Power Rankings" },
  { to: "/play", label: "Play" },
  { to: "/rewards", label: "Rewards" },
  { to: "/the-show", label: "The Show" },
  { to: "/scoring", label: "How Scoring Works" },
] as const;

export function CoachFacePageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="CoachFace home">
            <span className="grid size-9 place-items-center rounded-sm bg-primary font-display text-xl font-black text-primary-foreground">
              CF
            </span>
            <span className="hidden font-display text-xl font-black uppercase tracking-tight sm:block">
              CoachFace
            </span>
          </Link>
          <nav
            className="hidden items-center gap-6 text-sm font-semibold md:flex"
            aria-label="Main navigation"
          >
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: "text-foreground" }}
                inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
                className="transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Button size="sm" asChild>
            <Link to="/auth">Sign in</Link>
          </Button>
        </div>
        <nav
          className="flex gap-5 overflow-x-auto border-t border-border/60 px-5 py-3 text-xs font-bold md:hidden"
          aria-label="Mobile navigation"
        >
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="shrink-0 text-muted-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
      <footer className="border-t border-game-border bg-foreground py-9 text-background">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-5 sm:flex-row sm:items-center lg:px-8">
          <div>
            <p className="font-display text-xl font-black uppercase">CoachFace</p>
            <p className="text-xs text-game-muted">The game behind the game.</p>
          </div>
          <p className="text-xs text-game-muted">
            Free weekly play. Paid contests available only where eligible.
          </p>
        </div>
        <nav
          className="mx-auto mt-6 flex max-w-7xl flex-wrap justify-center gap-x-6 gap-y-2 px-5 text-xs font-bold text-game-muted lg:px-8"
          aria-label="Legal"
        >
          <Link to="/terms" className="hover:text-background">
            Terms of Service
          </Link>
          <Link to="/game-rules" className="hover:text-background">
            Game Rules
          </Link>
          <Link to="/privacy" className="hover:text-background">
            Privacy Policy
          </Link>
          <Link to="/fair-play" className="hover:text-background">
            Fair Play Policy
          </Link>
        </nav>
        <div className="mx-auto mt-6 max-w-7xl px-5 lg:px-8">
          <p className="text-center text-xs text-game-muted/60">
            © 2026 CoachFace. All Rights Reserved. CoachFace™ is a sports fantasy platform developed
            and operated by SCOSTrade.
          </p>
        </div>
      </footer>
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
}) {
  return (
    <section className="border-b border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8 lg:py-20">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 max-w-4xl font-display text-5xl font-black uppercase leading-[0.9] tracking-tight sm:text-7xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        {aside}
      </div>
    </section>
  );
}
