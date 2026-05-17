"use client";

import { useEffect, useRef, useState } from "react";

// Smoothly reveals a frequently-changing target string.
//
// Deepgram interim results arrive in word-chunks and are sometimes
// revised, so binding straight to state makes the live transcript jump.
// This eases a "shown length" toward the target so words type in
// smoothly, and on a revision only rewinds to the common prefix.
//
// The rAF loop is self-stopping — it only runs while there's catching
// up to do, so an idle transcript costs zero frames.

export function useSmoothText(target: string): string {
  const [shown, setShown] = useState("");
  const targetRef = useRef(target);
  const lenRef = useRef(0);
  const rafRef = useRef(0);
  const runningRef = useRef(false);

  const stop = () => {
    cancelAnimationFrame(rafRef.current);
    runningRef.current = false;
  };

  const run = () => {
    if (runningRef.current) return;
    runningRef.current = true;
    const tick = () => {
      const t = targetRef.current;
      if (lenRef.current < t.length) {
        const remaining = t.length - lenRef.current;
        lenRef.current += Math.max(1, Math.ceil(remaining / 12));
        if (lenRef.current > t.length) lenRef.current = t.length;
        setShown(t.slice(0, lenRef.current));
        rafRef.current = requestAnimationFrame(tick);
      } else {
        if (lenRef.current > t.length) {
          lenRef.current = t.length;
          setShown(t.slice(0, lenRef.current));
        }
        runningRef.current = false; // caught up — idle, no frames
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const prev = targetRef.current;
    if (!target.startsWith(prev.slice(0, lenRef.current))) {
      let common = 0;
      const max = Math.min(prev.length, target.length);
      while (common < max && prev[common] === target[common]) common++;
      lenRef.current = Math.min(lenRef.current, common);
    }
    targetRef.current = target;
    if (target === "") {
      lenRef.current = 0;
      setShown("");
      stop();
      return;
    }
    if (lenRef.current !== target.length) run();
  }, [target]);

  useEffect(() => stop, []);

  return shown;
}
