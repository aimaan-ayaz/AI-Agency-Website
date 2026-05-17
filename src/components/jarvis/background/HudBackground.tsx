"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { BGPattern } from "@/components/bg-pattern";

// Three.js loads client-only and only here — code-split into /jarvis,
// never touching the marketing site bundle.
const ParticleField = dynamic(() => import("./ParticleField"), {
  ssr: false,
  loading: () => null,
});

/**
 * Atmosphere: the site's own dot pattern → drifting dust → ambient
 * hairline → vignette. Monochrome, quiet, premium.
 *
 * The WebGL dust field is skipped on touch / coarse-pointer devices and
 * when reduced-motion is requested — there a second canvas alongside
 * the orb just costs battery/jank; the CSS layers carry the look.
 */
export default function HudBackground({ dim = false }: { dim?: boolean }) {
  const [richFx, setRichFx] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setRichFx(!coarse && !reduced);
  }, []);

  return (
    <div
      className="absolute inset-0 -z-10 pointer-events-none"
      style={{ opacity: dim ? 0.55 : 1, transition: "opacity 1.4s ease" }}
      aria-hidden
    >
      <BGPattern
        variant="dots"
        fill="rgba(255,255,255,0.04)"
        size={26}
        mask="fade-edges"
      />
      {richFx && <ParticleField />}
      <div className="j-drift" style={{ top: 0 }} />
      <div className="j-vignette" />
    </div>
  );
}
