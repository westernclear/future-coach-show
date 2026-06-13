import { SectionTitle, FlowStep, Card, Tag } from "./shared";

const adapters = [
  { sport: "Football (NFL)", provider: "Sportradar NFL API", events: ["Play-by-play", "4th down decisions", "Challenge outcomes", "Timeout usage", "Win/loss"], cadence: "Near-realtime webhook + polling fallback" },
  { sport: "Baseball (MLB)", provider: "MLB Stats API (free tier)", events: ["Lineup decisions", "Pitching changes", "Intentional walks", "Pinch-hit calls", "Game result"], cadence: "Polling every 90s during game windows" },
  { sport: "Basketball (NBA)", provider: "Stats Perform / Sportradar NBA", events: ["Timeout usage", "Challenge outcomes", "Substitution patterns", "Clutch-time decisions", "Win/loss"], cadence: "Near-realtime webhook" },
  { sport: "Soccer", provider: "Opta / Sportradar Soccer", events: ["Tactical formation changes", "Substitutions (timing & score context)", "Match result", "xG allowed vs expected"], cadence: "Webhook per match event" },
];

export function DataIngestion() {
  return (
    <div>
      <SectionTitle
        eyebrow="Section 5 · Event Ingestion"
        title="Live Data Pipeline"
        sub="A provider-agnostic ingestion layer normalises raw feed events into CoachFace's canonical schema before the Scoring Engine processes them."
      />

      <div className="mb-10">
        <h3 className="font-bold mb-4">Ingestion Flow</h3>
        <FlowStep number="1" title="Feed Delivery" description="Licensed provider pushes webhooks (or CoachFace polls) for each game event. Events include external_event_id for idempotency." tags={["Webhook", "Polling", "HMAC signature"]} />
        <FlowStep number="2" title="Edge Function Receiver" description="Supabase Edge Function validates the HMAC signature, parses the payload, and upserts into raw_game_events — duplicate external_event_id silently ignored." tags={["Edge Function", "Idempotent", "Deno"]} />
        <FlowStep number="3" title="Sport Adapter Worker" description="Inngest job picks up unprocessed raw_game_events rows. Each sport has a typed adapter that maps provider fields to the canonical CoachFace event shape and resolves the coach_id." tags={["Inngest", "Adapter pattern", "coach_id resolution"]} />
        <FlowStep number="4" title="Rule Evaluation" description="The Scoring Engine evaluates the normalised event against the current scoring_rule_version for that sport, computes points and confidence, writes a score_event row." tags={["Rule engine", "Versioned", "Explanation"]} />
        <FlowStep number="5" title="Snapshot + Cache Refresh" description="pg_cron triggers a score_snapshot upsert every 60 minutes. Leaderboard aggregate is pushed to Upstash Redis for sub-10ms read latency." tags={["pg_cron", "Redis", "Leaderboard"]} />
        <FlowStep number="6" title="Realtime Fan-out" description="Postgres CDC detects new score_events rows and Supabase Realtime pushes diff payloads to subscribed WebSocket clients. No polling needed client-side." tags={["CDC", "WebSocket", "Diff"]} />
      </div>

      <h3 className="font-bold mb-4">Sport Feed Adapters</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {adapters.map((a) => (
          <Card key={a.sport}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-sm">{a.sport}</p>
              <Tag variant="blue">{a.cadence.startsWith("Near") ? "Realtime" : "Polling"}</Tag>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{a.provider} · {a.cadence}</p>
            <div className="flex flex-wrap gap-1">
              {a.events.map(e => <span key={e} className="rounded bg-secondary px-2 py-0.5 text-xs">{e}</span>)}
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6 !border-orange-500/30 !bg-orange-500/5">
        <p className="font-bold text-sm mb-1">Manual Override / CSV Import</p>
        <p className="text-sm text-muted-foreground">Admin UI allows uploading a structured CSV of game events for any sport. The same adapter pipeline processes manual events with <code className="text-xs font-mono bg-secondary px-1 rounded">source = 'manual'</code> for full traceability.</p>
      </Card>
    </div>
  );
}
