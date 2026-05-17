"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useMic } from "@/lib/jarvis/useMic";
import { useDeepgram } from "@/lib/jarvis/useDeepgram";
import { buildGreeting } from "@/lib/jarvis/speech";
import { useJarvisVoice } from "@/lib/jarvis/useJarvisVoice";
import { useConvoActions } from "../conversation";
import type { OrbState } from "./VoiceOrb";

type JarvisUser = "Aimaan" | "Zaid";
type Msg = { role: "user" | "assistant"; content: string };

const EASE = [0.22, 1, 0.36, 1] as const;
const PARTIAL_THROTTLE = 90; // ms — cap transcript-state churn

const VoiceOrb = dynamic(() => import("./VoiceOrb"), {
  ssr: false,
  loading: () => null,
});

// Stream the chat route to completion, return the full reply text.
async function askJarvis(operator: string, history: Msg[]): Promise<string> {
  const res = await fetch("/api/jarvis/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operator, messages: history }),
  });
  if (!res.ok || !res.body) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d?.error || "server_error");
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const frames = buf.split("\n\n");
    buf = frames.pop() ?? "";
    for (const f of frames) {
      const l = f.trim();
      if (!l.startsWith("data:")) continue;
      const e = JSON.parse(l.slice(5).trim());
      if (e.t === "delta") out += e.v;
      else if (e.t === "error") throw new Error(e.kind || "server_error");
    }
  }
  return out.trim();
}

const DEBUG = process.env.NODE_ENV !== "production";
const SESSION_MSG =
  "Session expired. Reload the page and re-enter your access key.";

export default function VoiceMode({ user }: { user: JarvisUser }) {
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [handsFree, setHandsFree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trace, setTrace] = useState<string[]>([]);
  const logEvt = useCallback((name: string) => {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log("[jarvis/voice]", name);
      setTrace((t) => [...t.slice(-6), name]);
    }
  }, []);

  // Conversation store — ACTIONS only (stable identity), so transcript
  // updates never re-render this component or the 3D orb.
  const convo = useConvoActions();

  const historyRef = useRef<Msg[]>([]);
  const stateRef = useRef<OrbState>("idle");
  const handsFreeRef = useRef(false);
  stateRef.current = orbState;
  handsFreeRef.current = handsFree;

  const levelRef = useRef(0);
  const lastPartialTs = useRef(0);
  const revealRafRef = useRef(0);

  // Feedback-loop defenses (JARVIS hears himself on speakers):
  const startingRef = useRef(false); // re-entrancy guard
  const lastReplyRef = useRef(""); // for echo detection
  const listenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const beginListeningRef = useRef<() => void>(() => {});

  const norm = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

  // True when the recognized text is mostly JARVIS's own last words —
  // i.e. speaker bleed picked up by the mic, not the user.
  const looksLikeEcho = useCallback((text: string) => {
    const lr = lastReplyRef.current;
    if (!lr) return false;
    const uw = norm(text).split(" ").filter(Boolean);
    if (uw.length === 0) return false;
    const lw = new Set(norm(lr).split(" ").filter(Boolean));
    const hit = uw.filter((w) => lw.has(w)).length;
    return hit / uw.length >= 0.6;
  }, []);

  // Re-listen after a cooldown so the TTS tail / room echo dies down
  // before the mic opens (kills the self-conversation loop).
  const scheduleListen = useCallback((ms = 550) => {
    if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
    listenTimerRef.current = setTimeout(() => beginListeningRef.current(), ms);
  }, []);

  const onDoubleClap = useCallback(() => {
    if (handsFreeRef.current && stateRef.current === "idle") beginListening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { start: micStart, stop: micStop } = useMic({ onDoubleClap, levelRef });
  const dg = useDeepgram(levelRef);
  const voice = useJarvisVoice(levelRef);

  const goIdle = useCallback(() => {
    startingRef.current = false;
    setOrbState("idle");
    if (handsFreeRef.current) micStart();
    else micStop();
  }, [micStart, micStop]);

  // Reveal an assistant turn's text paced to the speech duration, so
  // words appear smoothly in time with the voice.
  const startReveal = useCallback(
    (id: string, len: number, durSec: number) => {
      cancelAnimationFrame(revealRafRef.current);
      const start = performance.now();
      const ms = Math.max(600, durSec * 1000);
      const step = () => {
        const frac = Math.min(1, (performance.now() - start) / ms);
        convo.setReveal(id, Math.floor(frac * len));
        if (frac < 1) revealRafRef.current = requestAnimationFrame(step);
        else convo.setReveal(id, len);
      };
      revealRafRef.current = requestAnimationFrame(step);
    },
    [convo]
  );

  const handleUtterance = useCallback(
    async (text: string) => {
      startingRef.current = false;

      // Echo guard: if the mic just picked up JARVIS's own voice off
      // the speakers, ignore it and keep listening for the real user.
      if (looksLikeEcho(text)) {
        convo.setPartial("");
        scheduleListen(400);
        return;
      }

      convo.commitUser(text);
      setOrbState("processing");
      historyRef.current = [
        ...historyRef.current,
        { role: "user" as const, content: text },
      ].slice(-24);

      const aid = convo.startAssistant(); // thinking turn

      try {
        const answer = await askJarvis(user, historyRef.current);
        historyRef.current = [
          ...historyRef.current,
          { role: "assistant" as const, content: answer },
        ].slice(-24);
        lastReplyRef.current = answer;
        convo.setAssistantContent(aid, answer);
        setOrbState("speaking");
        voice.speak(answer, {
          onReady: (dur) => startReveal(aid, answer.length, dur),
          onEnd: () => {
            convo.endAssistant(aid);
            scheduleListen(); // auto follow-up after a cooldown
          },
          onError: (k) => {
            convo.endAssistant(aid);
            if (k === "unauthorized") {
              setError(SESSION_MSG);
              goIdle();
              return;
            }
            scheduleListen();
          },
        });
      } catch (e) {
        const kind = e instanceof Error ? e.message : "server_error";
        if (kind === "unauthorized") {
          convo.setAssistantContent(aid, "Session expired.");
          convo.endAssistant(aid);
          setError(SESSION_MSG);
          goIdle();
          return;
        }
        convo.setAssistantContent(
          aid,
          kind === "rate_limit"
            ? "Too many requests — give me a moment."
            : kind === "unconfigured"
            ? "My Claude key isn't set on the server."
            : "Something went wrong reaching my core."
        );
        convo.endAssistant(aid);
        setError(kind === "server_error" ? "Connection issue." : null);
        goIdle();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [user, convo, voice, startReveal, goIdle]
  );

  const beginListening = useCallback(async () => {
    // Re-entrancy guard — no stacking listen sessions / token spam.
    if (stateRef.current === "listening" || startingRef.current) return;
    startingRef.current = true;
    if (listenTimerRef.current) {
      clearTimeout(listenTimerRef.current);
      listenTimerRef.current = null;
    }
    setError(null);
    voice.cancel();
    micStop();
    convo.setPartial("");
    setOrbState("listening");
    setTrace([]);
    dg.start({
      onEvent: logEvt,
      onInterim: (t) => {
        const now = performance.now();
        if (now - lastPartialTs.current < PARTIAL_THROTTLE) return;
        lastPartialTs.current = now;
        convo.setPartial(t);
      },
      onFinal: (t) => {
        startingRef.current = false;
        handleUtterance(t);
      },
      onEnd: () => {
        startingRef.current = false;
        if (stateRef.current === "listening") {
          convo.setPartial("");
          goIdle();
        }
      },
      onError: (k) => {
        const msg =
          k === "unauthorized"
            ? SESSION_MSG
            : k === "not-allowed"
            ? "Microphone blocked. Allow mic access in the address bar, then retry."
            : k === "audio-capture"
            ? "No microphone available (another app/tab may hold it)."
            : k === "unconfigured"
            ? "Deepgram key not set on the server."
            : k === "mint_failed" || k === "dg_auth"
            ? "Deepgram rejected the stream — use an Owner/Admin key."
            : k === "rate_limit"
            ? "Too many requests — give it a moment."
            : "Couldn't reach Deepgram. Check the key and connection.";
        startingRef.current = false;
        setError(msg);
        if (stateRef.current === "listening") goIdle();
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dg, voice, micStop, convo, handleUtterance, goIdle]);

  // Keep a stable ref so scheduleListen's timer always calls the
  // latest beginListening.
  beginListeningRef.current = beginListening;

  const stopListening = useCallback(() => {
    if (listenTimerRef.current) {
      clearTimeout(listenTimerRef.current);
      listenTimerRef.current = null;
    }
    startingRef.current = false;
    dg.stop();
    voice.cancel();
    convo.setPartial("");
    goIdle();
  }, [dg, voice, convo, goIdle]);

  // Hands-free: keep the clap monitor alive while idle.
  useEffect(() => {
    if (handsFree) micStart();
    else if (stateRef.current === "idle") micStop();
  }, [handsFree, micStart, micStop]);

  // Teardown only on real unmount.
  const teardownRef = useRef<() => void>(() => {});
  teardownRef.current = () => {
    if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
    dg.stop();
    voice.cancel();
    micStop();
    cancelAnimationFrame(revealRafRef.current);
  };
  useEffect(() => () => teardownRef.current(), []);

  // Greeting once on open → then straight into listening.
  //
  // The guard lives INSIDE the timeout, not as an early `return`. React
  // 18 StrictMode (dev) runs effects mount→cleanup→mount: an early
  // ref-return + cleanup-cancelled timeout means the greeting is
  // scheduled, cancelled, then never rescheduled → it silently never
  // fires. Guarding inside the fired callback survives the double-mount.
  const greetedRef = useRef(false);
  useEffect(() => {
    const t = setTimeout(() => {
      if (greetedRef.current) return;
      greetedRef.current = true;
      const g = buildGreeting(user);
      const aid = convo.startAssistant();
      convo.setAssistantContent(aid, g);
      setOrbState("speaking");
      voice.speak(g, {
        onReady: (dur) => startReveal(aid, g.length, dur),
        onEnd: () => {
          convo.endAssistant(aid);
          scheduleListen();
        },
        onError: () => {
          convo.endAssistant(aid);
          scheduleListen();
        },
      });
    }, 650);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const listening = orbState === "listening";
  const busy = orbState === "processing" || orbState === "speaking";
  const stateLabel =
    orbState === "idle"
      ? handsFree
        ? "Standby · double-clap to wake"
        : "Standby"
      : orbState === "listening"
      ? "Listening"
      : orbState === "processing"
      ? "Thinking"
      : "Speaking";

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Orb fills the stage — transcript lives in the right panel now */}
      <div className="absolute inset-0">
        <VoiceOrb state={orbState} levelRef={levelRef} />
      </div>

      {/* Hidden hands-free toggle — top-left, subtle until armed */}
      <button
        onClick={() => setHandsFree((v) => !v)}
        title="Toggle hands-free (continuous listen + double-clap wake)"
        className="absolute top-3 left-3 z-20 flex items-center gap-2 px-2.5 py-1.5 rounded-full j-ease transition-all"
        style={{
          border: `1px solid ${
            handsFree ? "rgba(207,228,245,0.4)" : "var(--j-line-soft)"
          }`,
          opacity: handsFree ? 1 : 0.22,
        }}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${handsFree ? "j-breathe" : ""}`}
          style={{
            background: handsFree ? "var(--j-signal-c)" : "rgba(255,255,255,0.4)",
          }}
        />
        {handsFree && (
          <span className="j-mono text-[9px] tracking-[0.25em] uppercase text-white/70">
            Hands-free
          </span>
        )}
      </button>

      {/* State readout */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
        <AnimatePresence mode="wait">
          <motion.span
            key={stateLabel}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="j-mono text-[10px] tracking-[0.4em] uppercase"
            style={{ color: listening ? "var(--j-signal-c)" : "var(--j-t-3)" }}
          >
            {stateLabel}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Error chip */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-12 left-1/2 -translate-x-1/2 z-30 w-[88%] max-w-md"
          >
            <p
              className="font-inter text-[12px] leading-snug px-3.5 py-2 rounded-xl text-center"
              style={{
                color: "rgba(255,255,255,0.78)",
                background: "rgba(217,107,107,0.08)",
                border: "1px solid rgba(217,107,107,0.22)",
              }}
            >
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dev-only diagnostics — never rendered in the production build */}
      {DEBUG && trace.length > 0 && (
        <div className="absolute top-2 right-3 z-20 text-right pointer-events-none">
          <p className="j-mono text-[9px] tracking-[0.12em] text-white/25 leading-relaxed">
            {trace.join(" · ")}
          </p>
        </div>
      )}

      {/* Mic control */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2.5">
        <button
          onClick={listening ? stopListening : beginListening}
          disabled={busy}
          aria-label={listening ? "Stop listening" : "Start listening"}
          className="w-14 h-14 rounded-full flex items-center justify-center j-ease transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            border: `1px solid ${
              listening ? "rgba(207,228,245,0.55)" : "var(--j-line-strong)"
            }`,
            background: listening
              ? "rgba(207,228,245,0.08)"
              : "rgba(255,255,255,0.03)",
          }}
        >
          {listening ? (
            <span
              className="w-4 h-4 rounded-[3px]"
              style={{ background: "var(--j-signal-c)" }}
            />
          ) : (
            <svg
              className="w-5 h-5 text-white/80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v4" />
            </svg>
          )}
        </button>
        <span className="j-label">
          {listening ? "Tap to stop" : busy ? "" : "Tap to speak"}
        </span>
      </div>
    </div>
  );
}
