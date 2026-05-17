"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Premium boot. No "INITIALIZING / loading bar" sci-fi clichés — those
// are exactly what read as a cheap JARVIS knockoff. Instead: the
// Blanka wordmark inked in by a smooth left→right wipe (the same
// language as the marketing site's hero), a hairline drawn from
// centre, one quiet tagline, a single restrained light sheen. Pure
// luxury minimalism, ~3s, then a clean fade into the gate.

const EASE = [0.22, 1, 0.36, 1] as const;

export default function BootSequence({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setLeaving(true), 2950),
      setTimeout(onComplete, 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "var(--j-bg)" }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <div className="flex flex-col items-center">
        <motion.span
          className="j-label"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE }}
        >
          Zaid Agency
        </motion.span>

        {/* Wordmark: faint outline, then inked in by a smooth wipe */}
        <motion.div
          className="relative mt-7 leading-none select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="j-mark block text-[3rem] sm:text-[4.75rem]">
            JARVIS
          </span>
          <motion.span
            aria-hidden
            className="j-mark-fill absolute inset-0 text-[3rem] sm:text-[4.75rem]"
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: 1.5, delay: 0.35, ease: EASE }}
          >
            JARVIS
          </motion.span>
          {/* single soft sheen sweeping across once */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-1/3"
            style={{
              background:
                "linear-gradient(105deg,transparent,rgba(255,255,255,0.10),transparent)",
            }}
            initial={{ left: "-40%", opacity: 0 }}
            animate={{ left: "120%", opacity: [0, 1, 0] }}
            transition={{ duration: 1.1, delay: 0.7, ease: EASE }}
          />
        </motion.div>

        {/* Hairline drawn from centre */}
        <motion.div
          className="h-px w-48 sm:w-64 mt-8 origin-center"
          style={{
            background:
              "linear-gradient(90deg,transparent,rgba(255,255,255,0.32),transparent)",
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 1.15, ease: EASE }}
        />

        {/* One quiet tagline — not a status readout */}
        <motion.span
          className="j-mono text-[10px] tracking-[0.5em] uppercase mt-7"
          style={{ color: "var(--j-t-4)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, delay: 1.7, ease: EASE }}
        >
          Private Intelligence
        </motion.span>
      </div>
    </motion.div>
  );
}
