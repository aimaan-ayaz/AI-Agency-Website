"use client";

import { motion } from "framer-motion";
import {
  SiNextdotjs,
  SiReact,
  SiFramer,
  SiVercel,
  SiSupabase,
  SiOpenai,
  SiAnthropic,
  SiN8N,
  SiMake,
  SiStripe,
  SiTailwindcss,
  SiTypescript,
  SiPython,
} from "react-icons/si";
import type { IconType } from "react-icons";

const LOGOS: { name: string; Icon: IconType }[] = [
  { name: "Next.js", Icon: SiNextdotjs },
  { name: "React", Icon: SiReact },
  { name: "Framer", Icon: SiFramer },
  { name: "Vercel", Icon: SiVercel },
  { name: "Supabase", Icon: SiSupabase },
  { name: "OpenAI", Icon: SiOpenai },
  { name: "Anthropic", Icon: SiAnthropic },
  { name: "n8n", Icon: SiN8N },
  { name: "Make", Icon: SiMake },
  { name: "Stripe", Icon: SiStripe },
  { name: "Tailwind CSS", Icon: SiTailwindcss },
  { name: "TypeScript", Icon: SiTypescript },
  { name: "Python", Icon: SiPython },
];

export default function TrustBar() {
  const set = [...LOGOS, ...LOGOS];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-[#0a0a0b] py-12 sm:py-20 overflow-hidden"
      aria-label="Tools we build with"
    >
      <p className="font-inter text-[12px] sm:text-[14px] text-white/45 text-center mb-6 sm:mb-8 tracking-tight px-4">
        Powered by the tools that power the best
      </p>

      <div className="relative">
        <div className="flex w-max gap-10 sm:gap-16 animate-trustbar will-change-transform">
          {set.map(({ name, Icon }, i) => (
            <div
              key={`${name}-${i}`}
              className="group flex items-center justify-center shrink-0"
              aria-label={name}
              title={name}
            >
              <Icon
                aria-hidden="true"
                className="h-5 sm:h-7 w-auto text-white/55 group-hover:text-white opacity-70 group-hover:opacity-100 transition-all duration-300"
              />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-[#0a0a0b] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-[#0a0a0b] to-transparent" />
      </div>
    </motion.section>
  );
}
