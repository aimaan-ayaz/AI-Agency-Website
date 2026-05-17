"use client";

import { useCallback, useEffect, useRef, type MutableRefObject } from "react";
import { getAudioContext } from "./speech";

// JARVIS's voice — ElevenLabs audio fetched from our server, decoded to
// an AudioBuffer and played through an AudioBufferSourceNode.
//
// Why a decoded buffer (not an <audio> element): HTMLAudioElement +
// MediaElementSource clips/stutters the first word (it starts before
// the decoder/graph are warm). A pre-decoded buffer plays sample-
// accurate from sample 0 — clean, premium, no stutter. `onReady` hands
// back the exact duration so the transcript reveal can be paced to the
// speech.

type SpeakOpts = {
  onReady?: (durationSec: number) => void;
  onEnd?: () => void;
  onError?: (kind: string) => void;
};

export function useJarvisVoice(levelRef: MutableRefObject<number>) {
  const srcRef = useRef<AudioBufferSourceNode | null>(null);
  const anRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef(0);
  const fallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stops the current utterance but keeps the SHARED AudioContext alive
  // (it's reused for every reply — recreating/closing it per utterance
  // both stutters and risks re-locking autoplay).
  const teardown = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    levelRef.current = 0;
    if (fallbackRef.current) {
      clearTimeout(fallbackRef.current);
      fallbackRef.current = null;
    }
    const s = srcRef.current;
    if (s) {
      s.onended = null;
      try {
        s.stop();
      } catch {}
      try {
        s.disconnect();
      } catch {}
    }
    srcRef.current = null;
    try {
      anRef.current?.disconnect();
    } catch {}
    anRef.current = null;
  }, [levelRef]);

  const cancel = useCallback(() => teardown(), [teardown]);

  const speak = useCallback(
    async (text: string, opts: SpeakOpts = {}) => {
      teardown();
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        opts.onEnd?.();
      };

      let arr: ArrayBuffer;
      try {
        const res = await fetch("/api/jarvis/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          opts.onError?.(d?.error || "tts_failed");
          return; // onError owns continuation — don't also fire onEnd
        }
        arr = await res.arrayBuffer();
      } catch {
        opts.onError?.("tts_failed");
        return;
      }

      const ctx = getAudioContext();
      if (!ctx) {
        opts.onError?.("no_audio");
        return;
      }

      let buffer: AudioBuffer;
      try {
        buffer = await ctx.decodeAudioData(arr.slice(0));
      } catch {
        opts.onError?.("decode");
        teardown();
        return;
      }

      const dur = buffer.duration;
      // Hand duration back so the caller paces the text reveal to it.
      opts.onReady?.(dur);

      try {
        await ctx.resume();
      } catch {}

      const src = ctx.createBufferSource();
      src.buffer = buffer;
      srcRef.current = src;
      const an = ctx.createAnalyser();
      an.fftSize = 512;
      anRef.current = an;
      src.connect(an);
      an.connect(ctx.destination);

      const abuf = new Uint8Array(an.fftSize);
      const tick = () => {
        an.getByteTimeDomainData(abuf);
        let s = 0;
        for (let i = 0; i < abuf.length; i++) {
          const v = (abuf[i] - 128) / 128;
          s += v * v;
        }
        const rms = Math.sqrt(s / abuf.length);
        levelRef.current = Math.min(1, levelRef.current * 0.55 + rms * 2.4 * 0.45);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);

      src.onended = () => {
        teardown();
        finish();
      };

      try {
        src.start(0);
      } catch {
        teardown();
        finish();
        return;
      }

      // Safety net: if the context is blocked (e.g. greeting with no
      // user gesture) `onended` may never fire — still end the turn
      // after the known duration so the conversation flow continues.
      fallbackRef.current = setTimeout(() => {
        teardown();
        finish();
      }, dur * 1000 + 600);
    },
    [levelRef, teardown]
  );

  useEffect(() => () => teardown(), [teardown]);

  return { speak, cancel };
}
