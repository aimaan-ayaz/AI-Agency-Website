"use client";

// Route-scoped error boundary for /jarvis. If anything in the JARVIS
// tree throws at runtime in production, the user gets a calm, on-brand
// recovery screen instead of a broken page.

export default function JarvisError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 px-6 text-center bg-[#0a0a0b]">
      <span className="j-mark text-3xl sm:text-4xl">JARVIS</span>
      <p className="j-mono text-[10px] tracking-[0.4em] uppercase text-white/35">
        System interrupted
      </p>
      <p className="font-inter text-sm text-white/55 max-w-sm leading-relaxed">
        Something went wrong on this screen. Reinitialize to continue.
      </p>
      <button
        onClick={reset}
        className="mt-2 px-6 py-2.5 rounded-full border j-ease transition-all hover:bg-white/[0.04]"
        style={{ borderColor: "var(--j-line-strong)" }}
      >
        <span className="j-mono text-[10px] tracking-[0.35em] uppercase text-white/80">
          Reinitialize
        </span>
      </button>
    </div>
  );
}
