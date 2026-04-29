"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";

import { Typewriter } from "@/components/ui/Typewriter";

const SplineScene = dynamic(() => import("@/components/SplineScene"), {
  ssr: false,
});

export default function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      
      {/* Absolute Positioning Wrapper to prevent mask clipping */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full lg:w-[60%] h-[1000px] z-0 pointer-events-auto">
        <motion.div 
          className="w-full h-full relative origin-center [mask-image:linear-gradient(to_right,transparent,black_20%,black)] contrast-150 brightness-90"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-white/10 blur-[100px] rounded-full" />
          <SplineScene scene="/scene.splinecode" />
          {/* Physical Blackout Cover for the burnt-in WebGL watermark */}
          <div className="absolute bottom-0 right-0 w-full lg:w-[200px] h-[80px] bg-black z-50 pointer-events-none">
            {/* Premium Mobile Horizon Line to make the object cut look intentional */}
            <div className="absolute top-0 left-0 w-full flex flex-col items-center lg:hidden">
              <div className="absolute top-0 w-3/4 h-[2px] bg-white/20 blur-[6px]" />
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 w-full px-6 lg:px-0 lg:ml-[10vw] lg:w-[45%]">
        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col gap-6 pl-[35px]"
        >
          <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight text-gradient leading-[1.5] pb-2 md:pb-4">
            <Typewriter 
              text={"Everything You Need To Launch, Grow, and Automate\nBuilt For You."} 
              delay={800} 
              speed={45} 
            />
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-xl">
            We design and ship content, platforms, and systems that turn attention into income.
          </p>
        </motion.div>
      </div>

      {/* Premium Glass Horizon Separator Line */}
      <div className="absolute bottom-0 left-0 w-full z-50 pointer-events-none flex flex-col items-center">
        {/* Glow effect */}
        <div className="absolute bottom-0 w-1/2 h-[2px] bg-white/20 blur-[8px]" />
        {/* Crisp glass edge */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </section>
  );
}
