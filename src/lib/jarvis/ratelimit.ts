// Per-IP sliding-window rate limiter for the JARVIS chat route.
//
// Zero-budget guard: the chat route calls the paid Claude API, so an
// unbounded public endpoint could run up a bill. This caps requests per
// IP. State is in-memory, pinned to globalThis so it survives dev
// hot-reloads.
//
// GOTCHA (same as the access lockout): per-server-instance memory. On a
// single long-lived process (local dev, one small VPS) it's exact. On
// serverless with many cold instances each keeps its own window, so the
// effective limit is higher than configured. Acceptable for a 2-person
// private tool; revisit if JARVIS is ever exposed more widely.

const WINDOW_MS = 60_000; // 1 minute
const MAX_IN_WINDOW = 15; // generous for 2 humans; fatal for a script

type Bucket = number[]; // request timestamps (ms), newest last

const store: Map<string, Bucket> =
  (globalThis as { __jarvisRate?: Map<string, Bucket> }).__jarvisRate ??
  new Map<string, Bucket>();
(globalThis as { __jarvisRate?: Map<string, Bucket> }).__jarvisRate = store;

export type RateResult =
  | { allowed: true }
  | { allowed: false; retryAfter: number };

/** Record an attempt and report whether it's allowed. */
export function rateLimit(ip: string): RateResult {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  const recent = (store.get(ip) ?? []).filter((t) => t > cutoff);

  if (recent.length >= MAX_IN_WINDOW) {
    const oldest = recent[0];
    const retryAfter = Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000));
    store.set(ip, recent); // keep pruned list
    return { allowed: false, retryAfter };
  }

  recent.push(now);
  store.set(ip, recent);
  return { allowed: true };
}
