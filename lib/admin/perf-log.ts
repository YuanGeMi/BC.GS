/**
 * Temporary Desk latency tracing. On by default in development.
 * Set ADMIN_PERF_LOG=0 to silence, or =1 to force in production.
 */
export function adminPerfEnabled() {
  if (process.env.ADMIN_PERF_LOG === "0") return false;
  if (process.env.ADMIN_PERF_LOG === "1") return true;
  return process.env.NODE_ENV === "development";
}

export function adminPerfStart(label: string) {
  const t0 = performance.now();
  const id = Math.random().toString(36).slice(2, 8);
  if (adminPerfEnabled()) {
    console.log(`[admin-perf ${id}] ▶ ${label}`);
  }
  return {
    id,
    mark(step: string, extra?: string) {
      if (!adminPerfEnabled()) return;
      const ms = (performance.now() - t0).toFixed(1);
      console.log(
        `[admin-perf ${id}] · ${label}/${step} +${ms}ms${extra ? ` ${extra}` : ""}`,
      );
    },
    end(extra?: string) {
      if (!adminPerfEnabled()) return;
      const ms = (performance.now() - t0).toFixed(1);
      console.log(
        `[admin-perf ${id}] ◀ ${label} ${ms}ms${extra ? ` ${extra}` : ""}`,
      );
    },
  };
}
