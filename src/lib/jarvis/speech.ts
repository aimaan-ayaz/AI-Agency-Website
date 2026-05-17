// Greeting text + a shared, gesture-unlocked AudioContext.
//
// Browsers block audio until the user interacts. We "prime" a single
// shared AudioContext on the Authenticate click (a real user gesture)
// and reuse that same context for ElevenLabs playback — so the opening
// greeting reliably and instantly plays (critical for the reel). One
// reused context also avoids per-utterance create/close cost.

let sharedCtx: AudioContext | null = null;

function makeCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  return new Ctor();
}

/** The shared AudioContext (created on first use, resumed if needed). */
export function getAudioContext(): AudioContext | null {
  if (!sharedCtx) sharedCtx = makeCtx();
  if (sharedCtx && sharedCtx.state === "suspended") {
    sharedCtx.resume().catch(() => {});
  }
  return sharedCtx;
}

/**
 * Call inside a user gesture (the Authenticate click) to unlock audio.
 * Plays one silent sample so the context is fully running before the
 * greeting fires a moment later.
 */
export function primeAudio(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
  } catch {
    /* best-effort */
  }
}

/** "morning" | "afternoon" | "evening" from the user's local clock. */
export function partOfDay(d: Date = new Date()): string {
  const h = d.getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

/** Personalized, time-aware greeting spoken when the dashboard opens. */
export function buildGreeting(user: "Aimaan" | "Zaid"): string {
  const tod = partOfDay();
  if (user === "Aimaan") {
    return `Good ${tod}, Aimaan. All systems operational. Welcome back, sir.`;
  }
  return `Good ${tod}, Zaid. Good to see you, boss. All systems online.`;
}
