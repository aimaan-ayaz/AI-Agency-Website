"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  /** Average ms per character. */
  speed?: number;
  /** Delay before the first character (ms). */
  startDelay?: number;
  /** Fired once the full string is printed. */
  onDone?: () => void;
};

/**
 * Types `text` out character-by-character.
 *
 * Driven by a single requestAnimationFrame loop using elapsed wall-clock
 * time (not chained setTimeouts). This is resilient to React 18
 * StrictMode double-mounting and Next.js Fast Refresh — the loop simply
 * recomputes how many characters *should* be visible for the time
 * elapsed, so it can never stall partway.
 */
export function useTypewriter(
  text: string,
  { speed = 32, startDelay = 0, onDone }: Options = {}
): { shown: string; done: boolean } {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!text) {
      setShown("");
      setDone(true);
      onDoneRef.current?.();
      return;
    }

    setShown("");
    setDone(false);

    let raf = 0;
    let start = 0;
    let finished = false;

    const frame = (now: number) => {
      if (!start) start = now;
      const elapsed = now - start - startDelay;
      const chars =
        elapsed <= 0 ? 0 : Math.min(text.length, Math.floor(elapsed / speed));

      setShown(text.slice(0, chars));

      if (chars >= text.length) {
        if (!finished) {
          finished = true;
          setDone(true);
          onDoneRef.current?.();
        }
        return; // stop the loop
      }
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [text, speed, startDelay]);

  return { shown, done };
}
