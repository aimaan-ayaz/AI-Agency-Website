"use client";

import { ReactLenis } from "lenis/react";
import { usePathname } from "next/navigation";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // The /fashion 3D studio needs raw wheel events for OrbitControls zoom —
  // Lenis's smoothWheel would swallow them and break pinch/scroll-to-zoom.
  // The studio is a fixed full-viewport stage with nothing to smooth-scroll,
  // so we opt it out entirely.
  if (pathname?.startsWith("/fashion")) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ lerp: 0.05, duration: 1.5, smoothWheel: true, syncTouch: false }}>
      {children}
    </ReactLenis>
  );
}
