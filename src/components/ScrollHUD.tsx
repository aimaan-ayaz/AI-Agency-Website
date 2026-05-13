"use client";

import { useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";

export default function ScrollHUD() {
  const { scrollYProgress, scrollY } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.4,
  });

  const [pct, setPct] = useState(0);

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    const next = Math.round(latest * 100);
    setPct((prev) => (prev === next ? prev : next));
  });

  const mark1Opacity = useTransform(
    scrollY,
    [500, 900, 1700, 2100],
    [0, 0.5, 0.5, 0]
  );
  const mark1Y = useTransform(scrollY, [500, 2100], [0, -40]);

  const mark2Opacity = useTransform(
    scrollY,
    [2600, 3000, 4000, 4400],
    [0, 0.5, 0.5, 0]
  );
  const mark2Y = useTransform(scrollY, [2600, 4400], [0, -50]);

  const mark3Opacity = useTransform(
    scrollY,
    [4800, 5200, 6200, 6600],
    [0, 0.45, 0.45, 0]
  );

  return (
    <>
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 pointer-events-none hidden md:flex flex-col items-center gap-3 mix-blend-difference">
        <span className="text-[9px] font-mono text-white/45 tracking-[0.25em] uppercase [writing-mode:vertical-rl] rotate-180 tabular-nums">
          {pct.toString().padStart(2, "0")}%
        </span>
        <div className="h-24 w-px bg-white/10 relative overflow-hidden">
          <motion.div
            style={{ scaleY: smoothProgress, transformOrigin: "top" }}
            className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/50 to-white/20"
          />
        </div>
        <span className="text-[8px] font-mono text-white/25 tracking-[0.3em] uppercase [writing-mode:vertical-rl] rotate-180">
          SCROLL
        </span>
      </div>

      <motion.div
        style={{ opacity: mark1Opacity, y: mark1Y }}
        className="fixed top-[22vh] left-[5vw] z-30 pointer-events-none hidden lg:block mix-blend-difference"
      >
        <svg
          className="w-5 h-5 text-white/55"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.7"
        >
          <line x1="10" y1="2" x2="10" y2="18" />
          <line x1="2" y1="10" x2="18" y2="10" />
        </svg>
      </motion.div>

      <motion.div
        style={{ opacity: mark2Opacity, y: mark2Y }}
        className="fixed bottom-[30vh] right-[8vw] z-30 pointer-events-none hidden lg:block mix-blend-difference"
      >
        <svg
          className="w-4 h-4 text-white/55"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.7"
        >
          <line x1="8" y1="1" x2="8" y2="15" />
          <line x1="1" y1="8" x2="15" y2="8" />
          <line x1="3" y1="3" x2="13" y2="13" />
          <line x1="13" y1="3" x2="3" y2="13" />
        </svg>
      </motion.div>

      <motion.div
        style={{ opacity: mark3Opacity }}
        className="fixed top-[35vh] right-[6vw] z-30 pointer-events-none hidden lg:flex flex-col gap-1 mix-blend-difference"
      >
        <div className="w-6 h-px bg-white/55" />
        <div className="w-3 h-px bg-white/35 ml-auto" />
        <div className="w-4 h-px bg-white/45" />
      </motion.div>
    </>
  );
}
