import { cn } from "@/lib/utils";

export function SectionTitle({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mb-8 border-b border-border pb-6">
      <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">{eyebrow}</p>
      <h2 className="font-display text-3xl font-black uppercase tracking-tight">{title}</h2>
      {sub && <p className="mt-3 max-w-3xl text-muted-foreground leading-relaxed">{sub}</p>}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-lg border border-border bg-secondary/30 p-5", className)}>
      {children}
    </div>
  );
}

export function Tag({ children, variant = "default" }: { children: React.ReactNode; variant?: "default"|"blue"|"green"|"orange"|"red"|"purple" }) {
  const colors: Record<string, string> = {
    default: "bg-secondary text-secondary-foreground",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    green: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    orange: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
    red: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    purple: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  };
  return (
    <span className={cn("inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold", colors[variant])}>
      {children}
    </span>
  );
}

export function Table({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full text-sm">
        <thead className="bg-secondary/60">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, i) => (
            <tr key={i} className="bg-background/60 hover:bg-secondary/20 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 align-top">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-border bg-foreground/5 p-4 text-xs leading-relaxed font-mono text-foreground/80">
      {children}
    </pre>
  );
}

export function FlowStep({ number, title, description, tags = [] }: { number: string; title: string; description: string; tags?: string[] }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-display text-xs font-black text-primary-foreground">{number}</div>
        <div className="mt-1 flex-1 w-px bg-border" />
      </div>
      <div className="pb-6 min-w-0">
        <h4 className="font-bold text-sm">{title}</h4>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{description}</p>
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map(t => <Tag key={t}>{t}</Tag>)}
          </div>
        )}
      </div>
    </div>
  );
}
