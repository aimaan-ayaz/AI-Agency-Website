"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { primeAudio } from "@/lib/jarvis/speech";

type JarvisUser = "Aimaan" | "Zaid";

type GateState =
  | { kind: "idle" }
  | { kind: "verifying" }
  | { kind: "denied"; message: string; attemptsLeft?: number }
  | { kind: "locked"; retryAfter: number }
  | { kind: "granted"; user: JarvisUser };

const EASE = [0.22, 1, 0.36, 1] as const;

// ── The access mark: one thin ring, one slow orbiting arc ──────────
function Mark({ state }: { state: GateState["kind"] }) {
  const denied = state === "denied";
  const granted = state === "granted";
  const active = state === "verifying" || granted;
  const stroke = denied ? "var(--j-danger)" : "rgba(255,255,255,0.85)";

  return (
    <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
      {/* Static base ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: `1px solid ${
            denied ? "rgba(217,107,107,0.4)" : "rgba(255,255,255,0.12)"
          }`,
        }}
      />
      {/* Slow orbiting highlight arc */}
      <svg
        className="absolute inset-0 w-full h-full j-orbit"
        viewBox="0 0 100 100"
        style={{ animationDuration: active ? "3.4s" : "9s" }}
      >
        <circle
          cx="50"
          cy="50"
          r="49"
          fill="none"
          stroke={stroke}
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="34 274"
          opacity={active ? 0.95 : 0.6}
        />
      </svg>
      {/* Inner luminance */}
      <motion.div
        className="absolute rounded-full j-breathe"
        animate={{
          width: granted ? "120%" : "62%",
          height: granted ? "120%" : "62%",
          opacity: granted ? 0 : 1,
        }}
        transition={{ duration: 0.9, ease: EASE }}
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)",
        }}
      />
      <span className="j-mark text-lg sm:text-xl">JARVIS</span>
    </div>
  );
}

export default function AccessGate({
  onGranted,
}: {
  onGranted: (user: JarvisUser) => void;
}) {
  const [value, setValue] = useState("");
  const [state, setState] = useState<GateState>({ kind: "idle" });
  const [nudge, setNudge] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Lockout countdown.
  useEffect(() => {
    if (state.kind !== "locked") return;
    if (state.retryAfter <= 0) {
      setState({ kind: "idle" });
      return;
    }
    const t = setTimeout(
      () =>
        setState((s) =>
          s.kind === "locked" ? { ...s, retryAfter: s.retryAfter - 1 } : s
        ),
      1000
    );
    return () => clearTimeout(t);
  }, [state]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (state.kind === "verifying" || state.kind === "locked") return;
    const key = value.trim();
    if (!key) return;

    // Unlock audio INSIDE this user gesture so the greeting plays
    // instantly and reliably the moment the dashboard reveals.
    primeAudio();

    setState({ kind: "verifying" });
    try {
      const res = await fetch("/api/jarvis/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok && data.user) {
        const user = data.user as JarvisUser;
        setState({ kind: "granted", user });
        // The spoken greeting now happens when the dashboard opens
        // (in VoiceMode) — firing it here gets cut by the reveal.
        setTimeout(() => onGranted(user), 1250);
        return;
      }

      setValue("");
      if (data.locked || res.status === 423) {
        setState({ kind: "locked", retryAfter: data.retryAfter ?? 300 });
      } else if (data.error === "server_unconfigured") {
        setState({ kind: "denied", message: "ACCESS NOT CONFIGURED" });
      } else {
        setNudge(true);
        setTimeout(() => setNudge(false), 360);
        setState({
          kind: "denied",
          message: "ACCESS DENIED",
          attemptsLeft: data.attemptsLeft,
        });
      }
    } catch {
      setValue("");
      setState({ kind: "denied", message: "CONNECTION FAILURE" });
    }
  };

  const locked = state.kind === "locked";
  const granted = state.kind === "granted";
  const busy = locked || granted || state.kind === "verifying";

  const mm = locked
    ? String(Math.floor(state.retryAfter / 60)).padStart(2, "0")
    : "00";
  const ss = locked ? String(state.retryAfter % 60).padStart(2, "0") : "00";

  const statusText =
    state.kind === "verifying"
      ? "Verifying"
      : state.kind === "denied"
      ? state.message +
        (typeof state.attemptsLeft === "number"
          ? ` · ${state.attemptsLeft} left`
          : "")
      : locked
      ? `Locked · ${mm}:${ss}`
      : granted
      ? `Welcome, ${state.user}`
      : "";

  const statusColor =
    state.kind === "denied" || locked
      ? "var(--j-danger)"
      : granted
      ? "rgba(255,255,255,0.85)"
      : "var(--j-t-3)";

  return (
    <motion.div
      className="absolute inset-0 z-40 flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      {/* Soft unlock bloom */}
      <AnimatePresence>
        {granted && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.12) 40%, transparent 70%)",
            }}
            initial={{ width: 120, height: 120, opacity: 0.8, filter: "blur(8px)" }}
            animate={{
              width: 1400,
              height: 1400,
              opacity: 0,
              filter: "blur(40px)",
            }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </AnimatePresence>

      <div className={`flex flex-col items-center ${nudge ? "j-nudge" : ""}`}>
        <span className="j-label mb-12">Zaid Agency · Private Access</span>

        <Mark state={state.kind} />

        {/* Status line — fixed height so layout never jumps */}
        <div className="h-5 mt-11">
          <AnimatePresence mode="wait">
            {statusText && (
              <motion.span
                key={statusText}
                className="j-mono text-[10px] tracking-[0.35em] uppercase"
                style={{ color: statusColor }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {statusText}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Code entry */}
        <form onSubmit={submit} className="mt-7 w-[260px] sm:w-[300px]">
          <div className="relative flex items-center justify-center">
            <input
              ref={inputRef}
              type="password"
              inputMode="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              disabled={busy}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (state.kind === "denied") setState({ kind: "idle" });
              }}
              aria-label="Access code"
              placeholder="ACCESS CODE"
              className="w-full bg-transparent text-center outline-none
                         j-mono text-base tracking-[0.5em]
                         placeholder:text-sm placeholder:tracking-[0.35em]
                         disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                color: "var(--j-t-1)",
                caretColor: "rgba(255,255,255,0.7)",
              }}
            />
          </div>
          <div
            className="mt-4 h-px w-full origin-center transition-all duration-500 j-ease"
            style={{
              background: "rgba(255,255,255,0.5)",
              opacity: busy ? 0.15 : value ? 0.7 : 0.22,
            }}
          />

          <button
            type="submit"
            disabled={busy || !value.trim()}
            className="group mt-9 mx-auto flex items-center gap-3 px-6 py-2.5
                       rounded-full border j-ease transition-all
                       disabled:opacity-25 disabled:cursor-not-allowed
                       hover:bg-white/[0.04]"
            style={{ borderColor: "var(--j-line-strong)" }}
          >
            <span className="j-mono text-[10px] tracking-[0.35em] uppercase text-white/80">
              Enter
            </span>
            <span className="text-white/50 group-hover:text-white/90 group-hover:translate-x-0.5 transition-all duration-500 j-ease text-xs">
              →
            </span>
          </button>
        </form>
      </div>

      <span className="absolute bottom-8 j-label">EST. 2026 · Lucknow</span>
    </motion.div>
  );
}
