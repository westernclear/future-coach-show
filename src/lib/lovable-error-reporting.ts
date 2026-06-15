type LovableErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type LovableEvents = {
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: LovableErrorOptions,
  ) => void;
};

declare global {
  interface Window {
    __lovableEvents?: LovableEvents;
  }
}

export function reportLovableError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context,
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error",
    },
  );
  // Also forward to our own monitoring backend (fire-and-forget).
  try {
    const message =
      error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown error";
    const stack = error instanceof Error ? error.stack ?? null : null;
    void fetch("/api/public/monitoring/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        message,
        stack,
        route: window.location.pathname,
        source: typeof context.source === "string" ? context.source : "react_error_boundary",
        severity: "error",
        context,
      }),
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

let globalHandlersInstalled = false;

export function installGlobalErrorReporter() {
  if (typeof window === "undefined" || globalHandlersInstalled) return;
  globalHandlersInstalled = true;
  window.addEventListener("error", (event) => {
    reportLovableError(event.error ?? new Error(event.message), {
      source: "window.onerror",
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
  window.addEventListener("unhandledrejection", (event) => {
    reportLovableError(event.reason ?? new Error("Unhandled promise rejection"), {
      source: "unhandledrejection",
    });
  });
}
