import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
  route: z.string().max(500).optional().nullable(),
  stack: z.string().max(5000).optional().nullable(),
  severity: z.enum(["info", "warning", "error", "critical"]).optional(),
  source: z.string().max(100).optional(),
  context: z.record(z.unknown()).optional(),
});

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/monitoring/log-error")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      POST: async ({ request }) => {
        try {
          const json = await request.json();
          const parsed = bodySchema.safeParse(json);
          if (!parsed.success) {
            return new Response(JSON.stringify({ error: "invalid_payload" }), {
              status: 400,
              headers: { "Content-Type": "application/json", ...CORS_HEADERS },
            });
          }
          const { logMonitoringEvent } = await import("@/lib/monitoring/log.server");
          await logMonitoringEvent({
            kind: "client_error",
            severity: parsed.data.severity ?? "error",
            message: parsed.data.message,
            route: parsed.data.route ?? null,
            userAgent: request.headers.get("user-agent") ?? undefined,
            metadata: {
              source: parsed.data.source ?? "client",
              stack: parsed.data.stack ?? null,
              context: parsed.data.context ?? {},
            },
          });
          return new Response(JSON.stringify({ ok: true }), {
            status: 202,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
          });
        } catch (err) {
          console.error("[monitoring/log-error] failed", err);
          return new Response(JSON.stringify({ error: "internal" }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
          });
        }
      },
    },
  },
});
