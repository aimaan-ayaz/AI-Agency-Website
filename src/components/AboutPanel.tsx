"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import { BGPattern } from "@/components/bg-pattern";
import { useToday } from "@/lib/use-today";

const EDGE_TILT = 5;

function tiltedEdgePolygon(progress: number): string {
  if (progress <= 0) {
    return "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)";
  }
  if (progress >= 1) {
    return "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
  }

  const baseX = progress * (100 + EDGE_TILT * 2) - EDGE_TILT;
  const topX = Math.max(0, Math.min(100, baseX + EDGE_TILT));
  const bottomX = Math.max(0, Math.min(100, baseX - EDGE_TILT));

  return `polygon(0% 0%, ${topX.toFixed(2)}% 0%, ${bottomX.toFixed(2)}% 100%, 0% 100%)`;
}

export default function AboutPanel() {
  const today = useToday();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  const latchedProgress = useMotionValue(0);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > latchedProgress.get()) {
      latchedProgress.set(latest);
    }
  });

  const panelClip = useTransform(latchedProgress, (p) => {
    const wipe = Math.max(0, Math.min(p / 0.77, 1));
    return tiltedEdgePolygon(wipe);
  });

  const labelClip = useTransform(latchedProgress, (p) => {
    const raw = Math.max(0, Math.min((p - 0.78) / 0.22, 1));
    const eased = 1 - Math.pow(1 - raw, 3);
    const right = (1 - eased) * 100;
    return `inset(0 ${right.toFixed(2)}% 0 0)`;
  });

  return (
    <section ref={ref} id="about" className="relative h-[110vh] sm:h-[130vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <motion.div
          style={{ clipPath: panelClip }}
          className="absolute inset-0 bg-[#f1ede4] will-change-[clip-path] overflow-hidden"
        >
          <div className="absolute -bottom-32 -right-32 w-[560px] h-[560px] opacity-40 pointer-events-none">
            <BGPattern variant="dots" fill="rgba(0,0,0,0.35)" size={20} mask="fade-edges" />
          </div>

          <div className="absolute top-20 left-[55%] w-[280px] h-[280px] opacity-30 pointer-events-none hidden lg:block">
            <BGPattern variant="grid" fill="rgba(0,0,0,0.25)" size={28} mask="fade-edges" />
          </div>

          <div className="absolute -top-40 -left-40 w-[460px] h-[460px] rounded-full bg-gradient-to-br from-neutral-200/70 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute top-[20%] right-[8%] w-[320px] h-[320px] rounded-full bg-gradient-to-br from-orange-100/40 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute bottom-[10%] right-[30%] w-[260px] h-[260px] rounded-full bg-gradient-to-br from-blue-100/30 to-transparent blur-3xl pointer-events-none hidden md:block" />

          <div className="absolute top-[12%] right-[10%] w-48 h-48 rounded-full border border-black/12 pointer-events-none hidden md:block" />
          <div className="absolute top-[14%] right-[12%] w-36 h-36 rounded-full border border-black/8 pointer-events-none hidden md:block" />
          <div className="absolute bottom-[18%] left-[8%] w-28 h-28 rounded-full border border-black/15 pointer-events-none hidden md:block" />
          <div className="absolute top-[58%] left-[42%] w-16 h-16 rounded-full border border-black/10 pointer-events-none hidden md:block" />

          <div className="absolute top-[34%] left-[8%] w-px h-24 bg-gradient-to-b from-transparent via-black/20 to-transparent pointer-events-none hidden md:block" />
          <div className="absolute bottom-[22%] right-[14%] w-20 h-px bg-gradient-to-r from-transparent via-black/25 to-transparent pointer-events-none hidden md:block" />

          <div className="absolute top-[42%] right-[22%] w-2.5 h-2.5 rounded-full bg-black/20 pointer-events-none hidden md:block" />
          <div className="absolute bottom-[32%] left-[48%] w-1.5 h-1.5 rounded-full bg-black/25 pointer-events-none hidden md:block" />
          <div className="absolute top-[24%] left-[38%] w-1 h-1 rounded-full bg-black/30 pointer-events-none hidden md:block" />
          <div className="absolute bottom-[44%] right-[40%] w-1 h-1 rounded-full bg-black/25 pointer-events-none hidden md:block" />

          <svg
            className="absolute top-[22%] left-[44%] w-5 h-5 text-black/25 pointer-events-none hidden md:block"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <path d="M10 2v16M2 10h16" />
          </svg>
          <svg
            className="absolute bottom-[26%] right-[8%] w-4 h-4 text-black/30 pointer-events-none hidden md:block"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <path d="M10 2v16M2 10h16M3.5 3.5l13 13M16.5 3.5l-13 13" />
          </svg>
        </motion.div>

        <div className="absolute inset-0 mix-blend-difference pointer-events-none">
          <div className="absolute top-24 left-6 sm:top-28 sm:left-12 flex items-center gap-3 text-white/80 text-[10px] sm:text-xs font-mono tracking-[0.25em] uppercase">
            <div className="w-6 h-px bg-white/60" />
            <span>Zaid · Studio</span>
          </div>

          <div className="absolute top-24 right-6 sm:top-28 sm:right-12 flex items-center gap-3 text-white/70 text-[10px] sm:text-xs font-mono tracking-[0.25em] uppercase">
            <div className="w-8 h-px bg-white/50" />
            <span suppressHydrationWarning>{today ?? ""}</span>
          </div>

          <div className="relative h-full flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-28 max-w-7xl">
            <motion.div
              style={{ clipPath: labelClip }}
              className="flex items-center gap-4 mb-6 sm:mb-10"
            >
              <div className="w-10 sm:w-16 h-px bg-white" />
              <span className="text-white text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase">
                An AI Agency
              </span>
            </motion.div>

            <h2 className="font-walsheim text-xl sm:text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-white leading-[1.2] tracking-tight max-w-4xl">
              We are an AI-native product studio, crafting premium websites, scalable SaaS platforms, and autonomous AI agents for ambitious brands and venture-backed startups around the world.
            </h2>

            <div className="flex flex-wrap items-center gap-x-5 sm:gap-x-7 gap-y-3 mt-10 sm:mt-14 text-white/70 text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase">
              <span>Websites</span>
              <span className="w-1 h-1 rounded-full bg-white/60" />
              <span>SaaS Platforms</span>
              <span className="w-1 h-1 rounded-full bg-white/60" />
              <span>AI Agents</span>
              <span className="w-1 h-1 rounded-full bg-white/60" />
              <span>Automation</span>
            </div>
          </div>

          <div className="absolute bottom-10 left-6 sm:bottom-14 sm:left-12 flex items-center gap-3 text-white/60 text-[10px] font-mono tracking-[0.3em] uppercase">
            <span>EST. 2026</span>
            <div className="w-12 h-px bg-white/40" />
            <span>Lucknow · IN</span>
          </div>

          <div className="absolute bottom-10 right-6 sm:bottom-14 sm:right-12 flex flex-col items-center gap-3">
            <span className="text-white/65 text-[10px] font-mono tracking-[0.3em] uppercase [writing-mode:vertical-rl] rotate-180">
              Scroll
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
