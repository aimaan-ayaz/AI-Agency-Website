"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type MutableRefObject,
} from "react";

// Microphone amplitude monitor + double-clap detector.
//
// One getUserMedia stream → an AnalyserNode. A rAF loop computes a
// smoothed RMS level (0..1) into `levelRef` so the 3D orb can react
// every frame without re-rendering React. The same loop watches for two
// sharp transients close together → a "double clap" wake gesture.
//
// The mic track is fully stopped on `stop()` so the browser's recording
// indicator turns off when JARVIS isn't actively listening (privacy +
// it reads honestly on camera).

type Opts = {
  onDoubleClap?: () => void;
  // Shared with the Deepgram hook so the orb reads one amplitude
  // source regardless of which engine currently owns the mic.
  levelRef?: MutableRefObject<number>;
};

export function useMic({ onDoubleClap, levelRef: ext }: Opts = {}) {
  const internal = useRef(0);
  const levelRef = ext ?? internal;
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef(0);
  const runningRef = useRef(false);

  // Clap state
  const lastClapRef = useRef(0);
  const armedRef = useRef(true);
  const onClapRef = useRef(onDoubleClap);
  onClapRef.current = onDoubleClap;

  const loop = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser || !runningRef.current) return;

    const buf = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(buf);

    // RMS around the 128 midpoint → 0..1-ish
    let sum = 0;
    for (let i = 0; i < buf.length; i++) {
      const v = (buf[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / buf.length);
    // Smooth for the visual; clamp.
    levelRef.current = Math.min(1, levelRef.current * 0.7 + rms * 1.8 * 0.3);

    // Double-clap: sharp rising edge over a high threshold, with a
    // refractory gap so one clap isn't counted twice.
    const now = performance.now();
    if (rms > 0.32 && armedRef.current) {
      armedRef.current = false;
      const since = now - lastClapRef.current;
      if (since > 160 && since < 850) {
        lastClapRef.current = 0;
        onClapRef.current?.();
      } else {
        lastClapRef.current = now;
      }
    } else if (rms < 0.12) {
      armedRef.current = true; // re-arm once it goes quiet
    }

    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const start = useCallback(async (): Promise<boolean> => {
    if (runningRef.current) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new Ctx();
      ctxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.4;
      src.connect(analyser);
      analyserRef.current = analyser;
      runningRef.current = true;
      rafRef.current = requestAnimationFrame(loop);
      return true;
    } catch {
      return false; // permission denied / no device
    }
  }, [loop]);

  const stop = useCallback(() => {
    runningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    levelRef.current = 0;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    analyserRef.current = null;
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { levelRef, start, stop };
}
