"use client";

import { useEffect, useState, ReactNode } from "react";

/**
 * Renders nothing until the next two animation frames have elapsed.
 * This guarantees the hero has painted before any below-fold chunks
 * start fetching/rendering, so the initial paint stays fast.
 */
export function DeferredMount({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setMounted(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  return mounted ? <>{children}</> : null;
}
