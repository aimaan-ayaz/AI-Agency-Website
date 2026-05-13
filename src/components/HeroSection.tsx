"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring, MotionValue } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef } from "react";
import HoverSlideText from "@/components/HoverSlideText";

const HERO_ENTRY_DELAY = 0;
const LETTER_FONT_SIZE = "clamp(14rem, 45vh, 38rem)";
const COARSE_POINTER_QUERY = "(hover: none) and (pointer: coarse)";

function ZaiLetter({
  char,
  delay,
  marginTop,
  y,
  fillMask,
  opacityOnlyEntry,
}: {
  char: string;
  delay: number;
  marginTop?: string;
  y?: MotionValue<string>;
  fillMask: MotionValue<string>;
  opacityOnlyEntry?: boolean;
}) {
  const initial = opacityOnlyEntry ? { opacity: 0 } : { opacity: 0, y: 80 };
  const animate = opacityOnlyEntry ? { opacity: 1 } : { opacity: 1, y: 0 };

  return (
    <motion.span
      initial={initial}
      animate={animate}
      transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        ...(y ? { y } : {}),
        fontSize: LETTER_FONT_SIZE,
        lineHeight: 1,
        ...(marginTop ? { marginTop } : {}),
      }}
      className="relative inline-block font-blanka tracking-tight"
    >
      {/* Outline (always visible) — strokes the glyph perimeter */}
      <span
        className="block"
        style={{
          color: "transparent",
          WebkitTextStroke: "2px rgba(255,255,255,0.6)",
        }}
      >
        {char}
      </span>
      {/* Fill (drains left-to-right with scroll) — covers the inner area
          of the glyph including the small inner holes in the Blanka design */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          color: "rgba(255,255,255,0.6)",
          WebkitMaskImage: fillMask,
          maskImage: fillMask,
          textShadow:
            "0 0 0.5px rgba(255,255,255,0.6), 0 0 1px rgba(255,255,255,0.6), 0 0 2px rgba(255,255,255,0.6)",
        }}
      >
        {char}
      </motion.span>
    </motion.span>
  );
}

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const lettersOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.4]);

  const fillMask = useTransform(
    scrollYProgress,
    (p) => {
      const pct = p * 100;
      return `linear-gradient(to right, transparent 0%, transparent ${pct}%, black ${pct}%, black 100%)`;
    }
  );

  const mouseX = useMotionValue(0);
  const cursorX = useSpring(mouseX, { stiffness: 80, damping: 22, mass: 0.6 });
  const isCoarsePointerRef = useRef(false);

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    if (isCoarsePointerRef.current) return;
    const w = window.innerWidth;
    mouseX.set(((e.clientX - w / 2) / (w / 2)) * 18);
  };

  const handleLeave = () => {
    mouseX.set(0);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      isCoarsePointerRef.current = window.matchMedia(COARSE_POINTER_QUERY).matches;
    }
    const t = setTimeout(() => {
      const el = ref.current;
      if (el) el.style.opacity = "1";
    }, 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      ref={ref}
      id="home"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative min-h-[92vh] sm:min-h-screen bg-[#0a0a0b] flex items-center overflow-hidden"
    >
      <motion.div
        aria-hidden="true"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute top-[14vh] sm:top-[18vh] -right-16 sm:right-auto sm:left-[2vw] w-44 h-44 sm:w-40 sm:h-40 rounded-full border border-white/[0.04] sm:border-white/[0.05] pointer-events-none z-0 block"
      />

      <motion.div
        aria-hidden="true"
        animate={{ y: [0, -24, 0], opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[42%] left-[44%] w-[3px] h-[3px] rounded-full bg-white/40 pointer-events-none z-0 hidden md:block"
      />

      <motion.div
        aria-hidden="true"
        animate={{ y: [0, 20, 0], opacity: [0.2, 0.45, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
        className="absolute top-[68%] left-[58%] w-[2px] h-[2px] rounded-full bg-white/35 pointer-events-none z-0 hidden md:block"
      />

      <motion.div
        aria-hidden="true"
        animate={{ top: ["18%", "82%", "18%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[20%] right-[18%] h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent pointer-events-none z-0 hidden md:block"
      />

      {/* Mobile-only faint ZA watermark — fills empty space without competing with content */}
      <div
        aria-hidden="true"
        className="absolute right-[-6vw] bottom-[8vh] md:hidden pointer-events-none select-none z-0 font-blanka text-[32vw] leading-none tracking-tight"
        style={{
          color: "transparent",
          WebkitTextStroke: "1.5px rgba(255,255,255,0.07)",
        }}
      >
        ZA
      </div>

      {/* Mobile-only scroll hint at bottom */}
      <div
        aria-hidden="true"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 md:hidden pointer-events-none flex flex-col items-center gap-2 z-10"
      >
        <span className="text-[9px] font-mono tracking-[0.35em] uppercase text-white/30">
          Scroll
        </span>
        <motion.div
          animate={{ scaleY: [1, 1.5, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent origin-top"
        />
      </div>

      <motion.div
        style={{ opacity: lettersOpacity, x: cursorX, y: -70 }}
        className="absolute right-0 top-[10vh] bottom-0 w-[62%] hidden md:flex flex-col items-center justify-start pointer-events-none select-none z-0"
      >
        <ZaiLetter
          char="Z"
          delay={HERO_ENTRY_DELAY + 0.2}
          fillMask={fillMask}
        />
        <ZaiLetter
          char="A"
          delay={HERO_ENTRY_DELAY + 0.4}
          marginTop="calc(3vh - 10px)"
          fillMask={fillMask}
        />
      </motion.div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 w-full max-w-2xl px-6 sm:px-12 lg:pl-[11vw] lg:pr-12 font-inter pt-20 md:pt-0"
      >
        <div className="entry-scale-x entry-d-150 flex items-center gap-3 mb-6 sm:mb-7">
          <div className="w-8 h-px bg-white/30" />
          <motion.span
            animate={{ opacity: [1, 0.25, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-1 rounded-full bg-white/55"
          />
          <div className="w-2 h-px bg-white/20" />
        </div>

        <h1
          className="entry-fade entry-d-250 font-walsheim text-[2rem] sm:text-4xl md:text-[2.75rem] lg:text-[3.4rem] font-bold text-white tracking-tight max-w-xl flex flex-col gap-2 sm:gap-4 leading-[1.05]"
        >
          <span>An AI-native studio</span>
          <span>crafting digital</span>
          <span className="text-white/35">products.</span>
        </h1>

        <p
          className="entry-fade-soft entry-d-500 font-walsheim text-white/55 text-[15px] md:text-lg max-w-md leading-[1.6] sm:leading-[1.7] mt-6 sm:mt-9 font-normal"
        >
          We design websites, build SaaS platforms, and deploy autonomous AI agents that turn attention into revenue.
        </p>

        <div
          className="entry-fade-soft entry-d-700 mt-8 sm:mt-11 flex items-center gap-6 flex-wrap"
        >
          <Link
            href="/chat"
            className="group relative inline-flex items-center gap-3 pl-5 pr-4 py-2.5 rounded-full border border-white/15 hover:border-white/40 hover:bg-white/[0.04] transition-all text-[13px] font-medium text-white/85 hover:text-white font-inter"
          >
            <HoverSlideText text="Talk to our AI" className="tracking-tight" />
            <span
              className="inline-block transition-transform duration-[600ms] group-hover:translate-x-1 text-white/55 group-hover:text-white"
              style={{ transitionTimingFunction: "cubic-bezier(0.19,1,0.22,1)" }}
            >
              →
            </span>
          </Link>
        </div>
      </motion.div>

<motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: HERO_ENTRY_DELAY + 0.6 }}
        className="absolute top-1/2 left-6 sm:left-12 lg:left-[3.5vw] -translate-y-[26vh] hidden md:flex flex-col items-start gap-3 z-10 pointer-events-none"
      >
        <svg className="w-3 h-3 text-white/25" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="0.8">
          <line x1="8" y1="1" x2="8" y2="15" />
          <line x1="1" y1="8" x2="15" y2="8" />
        </svg>
        <div className="w-px h-16 bg-gradient-to-b from-white/25 via-white/10 to-transparent" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: HERO_ENTRY_DELAY + 0.95, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-1/2 left-6 sm:left-12 lg:left-[3.5vw] translate-y-[24vh] hidden md:flex flex-col items-start gap-3 z-10 pointer-events-none"
      >
        <div className="w-px h-16 bg-gradient-to-t from-white/25 via-white/10 to-transparent" />
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-white/40" />
          <div className="w-1 h-1 rounded-full bg-white/20" />
          <div className="w-1 h-1 rounded-full bg-white/15" />
        </div>
      </motion.div>
    </section>
  );
}
