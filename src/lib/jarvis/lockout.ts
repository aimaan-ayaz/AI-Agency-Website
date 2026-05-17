// In-memory brute-force lockout for the JARVIS access gate.
//
// Tracking lives on the SERVER, keyed by client IP, so clearing browser
// storage / using a new tab does not reset attempts. State is held in a
// module-level map pinned to `globalThis` so it survives Next.js dev
// hot-reloads.
//
// GOTCHA (read this): this is per-server-instance memory. On a single
// always-on server (local dev, a single small VPS/long-lived Node
// process) it behaves exactly as specified. On serverless/edge with
// many cold-started instances, each instance keeps its own count, so a
// determined attacker could get more tries by hitting different
// instances. For a 2-person private tool that is acceptable for now; we
// move this to the Supabase DB in Phase 4 for a hard global limit.

const MAX_ATTEMPTS = 5;
const LOCK_MS = 5 * 60 * 1000; // 5 minutes

type Entry = { count: number; lockUntil: number };

const store: Map<string, Entry> =
  (globalThis as { __jarvisLock?: Map<string, Entry> }).__jarvisLock ??
  new Map<string, Entry>();
(globalThis as { __jarvisLock?: Map<string, Entry> }).__jarvisLock = store;

export type LockStatus = {
  locked: boolean;
  /** Seconds remaining on the lock (0 if not locked). */
  retryAfter: number;
  /** Attempts left before lockout (0 while locked). */
  attemptsLeft: number;
};

function status(entry: Entry | undefined): LockStatus {
  const now = Date.now();
  if (entry && entry.lockUntil > now) {
    return {
      locked: true,
      retryAfter: Math.ceil((entry.lockUntil - now) / 1000),
      attemptsLeft: 0,
    };
  }
  const count = entry && entry.lockUntil <= now ? 0 : entry?.count ?? 0;
  return {
    locked: false,
    retryAfter: 0,
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - count),
  };
}

/** Check current lock state without recording an attempt. */
export function checkLock(ip: string): LockStatus {
  const entry = store.get(ip);
  // Expired lock — clean it up so the user starts fresh.
  if (entry && entry.lockUntil && entry.lockUntil <= Date.now()) {
    store.delete(ip);
    return status(undefined);
  }
  return status(entry);
}

/** Record one failed attempt; returns the resulting lock state. */
export function registerFailure(ip: string): LockStatus {
  const now = Date.now();
  const entry = store.get(ip) ?? { count: 0, lockUntil: 0 };
  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockUntil = now + LOCK_MS;
  }
  store.set(ip, entry);
  return status(entry);
}

/** Successful login — wipe the counter for this IP. */
export function clearFailures(ip: string): void {
  store.delete(ip);
}
