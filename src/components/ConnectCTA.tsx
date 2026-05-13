"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCTA } from "@/lib/cta-context";
import { useToday } from "@/lib/use-today";
import HoverSlideText from "@/components/HoverSlideText";

export default function ConnectCTA() {
  const router = useRouter();
  const { isCTAInView, setIsCTAInView } = useCTA();
  const sectionRef = useRef<HTMLElement>(null);
  const today = useToday();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsCTAInView(entry.isIntersecting),
      { rootMargin: "0px 0px -25% 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      setIsCTAInView(false);
    };
  }, [setIsCTAInView]);

  return (
    <section
      ref={sectionRef}
      id="connect-cta"
      className="relative bg-black overflow-hidden py-14 lg:py-20"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-white/[0.03] blur-3xl pointer-events-none hidden md:block" />
      <div className="absolute top-[10%] -left-32 w-[400px] h-[400px] rounded-full bg-violet-500/[0.05] blur-3xl pointer-events-none hidden md:block" />
      <div className="absolute bottom-[10%] -right-32 w-[400px] h-[400px] rounded-full bg-emerald-500/[0.04] blur-3xl pointer-events-none hidden md:block" />

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="cta-grid" width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M 6 0 L 0 0 0 6" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.15" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#cta-grid)" />
      </svg>

      <div className="container mx-auto max-w-5xl px-6 sm:px-8 lg:px-12 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-3 mb-8 font-inter"
        >
          <div className="w-8 h-px bg-white/30" />
          <p className="text-[10px] sm:text-xs text-white/50 font-mono tracking-[0.3em] uppercase">
            <span suppressHydrationWarning>{today ?? ""}</span>
            {today ? " — The Next Move" : "The Next Move"}
          </p>
          <div className="w-8 h-px bg-white/30" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-walsheim text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.05] tracking-tight mb-5"
        >
          Got a vision?
          <br />
          <span className="text-white/30">Let&apos;s ship it.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-white/55 text-sm md:text-base max-w-lg mx-auto leading-relaxed mb-10 font-inter font-light"
        >
          Tell us what you are building. We will reply within 24 hours with a plan, a quote, and a clear next step.
        </motion.p>

        <div className="flex items-center justify-center h-16 relative">
          {isCTAInView && (
            <motion.button
              layoutId="lets-connect-cta"
              onClick={() => router.push("/contact")}
              className="group relative bg-white text-black hover:bg-white/95 font-bold rounded-full transition-colors shadow-[0_0_40px_rgba(255,255,255,0.12)] flex items-center gap-2.5 font-inter"
              style={{
                padding: "0.85rem 1.75rem",
                fontSize: "0.9rem",
              }}
              transition={{
                layout: { duration: 1.1, ease: [0.32, 0.72, 0, 1] },
              }}
            >
              <HoverSlideText text={"Let’s Connect"} className="tracking-tight" />
              <motion.span
                className="inline-block"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              >
                →
              </motion.span>
            </motion.button>
          )}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 text-[10px] sm:text-xs text-white/35 font-mono tracking-[0.25em] uppercase font-inter"
        >
          Reply within 24 hours
        </motion.p>
      </div>
    </section>
  );
}
