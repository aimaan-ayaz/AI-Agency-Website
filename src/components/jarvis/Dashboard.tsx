"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import HudPanel from "./ui/HudPanel";
import ChatMode from "./ChatMode";
import VoiceMode from "./voice/VoiceMode";
import JarvisMarkdown from "./ui/JarvisMarkdown";
import {
  ConversationProvider,
  useConvoState,
} from "./conversation";
import { useSmoothText } from "@/lib/jarvis/useSmoothText";

type JarvisUser = "Aimaan" | "Zaid";
type Mode = "voice" | "chat";

const EASE = [0.22, 1, 0.36, 1] as const;

// ── Top bar ─────────────────────────────────────────────────────────
function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const t = now ? now.toLocaleTimeString("en-GB", { hour12: false }) : "--:--:--";
  const d = now
    ? now
        .toLocaleDateString("en-GB", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        })
        .toUpperCase()
    : "";
  return (
    <div className="text-center">
      <div className="j-mono text-sm tracking-[0.18em] text-white/80 tabular-nums">
        {t}
      </div>
      <div className="j-label mt-1.5">{d}</div>
    </div>
  );
}

function TopBar({
  user,
  onToggleSidebar,
}: {
  user: JarvisUser;
  onToggleSidebar: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5">
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="j-mark-fill text-base sm:text-xl">JARVIS</span>
        <span className="hidden sm:block w-px h-5 bg-white/10" />
        <span className="hidden sm:block j-label">Zaid Agency</span>
      </div>

      <Clock />

      <div className="flex items-center gap-5 sm:gap-6">
        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span className="j-label">Operator</span>
          <span className="font-walsheim text-sm text-white/85 mt-1">
            {user}
          </span>
        </div>
        <button
          onClick={onToggleSidebar}
          className="w-9 h-9 rounded-full border border-white/10 flex items-center
                     justify-center hover:border-white/25 hover:bg-white/[0.03]
                     transition-all duration-500 j-ease"
          aria-label="Notifications"
        >
          <svg
            className="w-4 h-4 text-white/55"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
        </button>
        <button
          className="w-9 h-9 rounded-full border border-white/10 flex items-center
                     justify-center hover:border-white/25 hover:bg-white/[0.03]
                     transition-all duration-500 j-ease"
          aria-label="Settings"
        >
          <svg
            className="w-4 h-4 text-white/45"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ModeToggle({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
}) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-full border border-white/[0.08] bg-black/30">
      {(["voice", "chat"] as Mode[]).map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          className="relative px-5 py-1.5 rounded-full j-mono text-[10px]
                     tracking-[0.25em] uppercase transition-colors duration-500 j-ease"
          style={{ color: mode === m ? "#0a0a0b" : "rgba(255,255,255,0.45)" }}
        >
          {mode === m && (
            <motion.span
              layoutId="mode-pill"
              className="absolute inset-0 rounded-full bg-white"
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            />
          )}
          <span className="relative z-[1]">{m}</span>
        </button>
      ))}
    </div>
  );
}

// ── Right sidebar ───────────────────────────────────────────────────
function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1 h-1 rounded-full"
          style={{ background: "var(--j-signal-c)" }}
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
          transition={{
            duration: 0.95,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { turns, partial, revealId, reveal } = useConvoState();
  const smoothPartial = useSmoothText(partial);
  const [view, setView] = useState<"transcript" | "tasks">("transcript");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, smoothPartial, reveal]);

  return (
    <>
      {/* Mobile dim backdrop when the drawer is open */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          aria-hidden
        />
      )}
      <div
        className={`overflow-hidden shrink-0
          fixed top-0 right-0 z-40 h-full w-[88%] max-w-sm p-2
          transition-transform duration-500 j-ease
          ${open ? "translate-x-0" : "translate-x-full"}
          md:static md:z-auto md:p-0 md:translate-x-0 md:h-full
          md:transition-[width] md:duration-500
          ${open ? "md:w-[360px]" : "md:w-[64px]"}`}
      >
      <HudPanel className="h-full" powerOn={false}>
        <div className="h-full flex flex-col p-4">
          {open ? (
            <>
              <div className="flex items-center gap-1 p-1 rounded-full border border-white/[0.07] bg-black/30 mb-4 shrink-0">
                {(["transcript", "tasks"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setView(t)}
                    className="relative flex-1 py-1.5 rounded-full j-mono text-[10px] tracking-[0.2em] uppercase transition-colors duration-500 j-ease"
                    style={{
                      color: view === t ? "#0a0a0b" : "rgba(255,255,255,0.45)",
                    }}
                  >
                    {view === t && (
                      <motion.span
                        layoutId="side-pill"
                        className="absolute inset-0 rounded-full bg-white"
                        transition={{
                          type: "spring",
                          stiffness: 320,
                          damping: 32,
                        }}
                      />
                    )}
                    <span className="relative z-[1]">{t}</span>
                  </button>
                ))}
              </div>

              {view === "transcript" ? (
                <div
                  ref={scrollRef}
                  data-lenis-prevent
                  className="flex-1 min-h-0 overflow-y-auto j-scroll pr-1 space-y-4"
                >
                  {turns.length === 0 && !partial ? (
                    <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
                      <span
                        className="w-1.5 h-1.5 rounded-full j-breathe"
                        style={{ background: "var(--j-signal-c)" }}
                      />
                      <span className="j-label">Transcript</span>
                      <span className="j-mono text-[9px] tracking-[0.2em] text-white/20 uppercase">
                        your conversation appears here
                      </span>
                    </div>
                  ) : (
                    <>
                      {turns.map((t) => (
                        <div
                          key={t.id}
                          className={t.role === "user" ? "text-right" : "text-left"}
                        >
                          <p className="j-label mb-1">
                            {t.role === "user" ? "You" : "JARVIS"}
                          </p>
                          {t.role === "assistant" &&
                          t.thinking &&
                          t.content === "" ? (
                            <ThinkingDots />
                          ) : t.role === "assistant" ? (
                            <div className="font-inter text-[13px] leading-[1.65] text-white/85">
                              <JarvisMarkdown
                                text={
                                  t.id === revealId
                                    ? t.content.slice(0, reveal)
                                    : t.content
                                }
                              />
                              {t.id === revealId &&
                                reveal < t.content.length && (
                                  <span className="j-caret" />
                                )}
                            </div>
                          ) : (
                            <p className="font-inter text-[13px] leading-[1.65] text-white/55 whitespace-pre-wrap break-words">
                              {t.content}
                            </p>
                          )}
                        </div>
                      ))}
                      {partial && (
                        <div className="text-right">
                          <p className="j-label mb-1">You</p>
                          <p className="font-inter text-[13px] leading-[1.65] text-white/35 italic">
                            {smoothPartial}
                            <span className="j-caret" />
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                  <span
                    className="w-1.5 h-1.5 rounded-full j-breathe"
                    style={{ background: "var(--j-signal-c)" }}
                  />
                  <span className="j-label">Inbox Clear</span>
                  <span className="j-mono text-[9px] tracking-[0.25em] text-white/15 uppercase">
                    n8n feed — phase 05
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="flex justify-center pt-1">
              <svg
                className="w-4 h-4 text-white/40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              </svg>
            </div>
          )}
        </div>
      </HudPanel>
      </div>
    </>
  );
}

// ── Bottom status bar — honest Phase-1 readout ──────────────────────
function StatusBar() {
  const items = [
    { label: "Core", state: "Online", live: true },
    { label: "Claude API", state: "Online", live: true },
    { label: "Voice I/O", state: "Online", live: true },
    { label: "Memory", state: "Offline", live: false },
    { label: "n8n", state: "Offline", live: false },
  ];
  return (
    <div className="flex items-center gap-x-5 sm:gap-x-7 gap-y-1.5 px-4 sm:px-7 py-2.5 sm:py-3 overflow-x-auto j-scroll whitespace-nowrap sm:flex-wrap sm:whitespace-normal sm:overflow-visible">
      {items.map((it) => (
        <span
          key={it.label}
          className="flex items-center gap-2.5 j-mono text-[10px] tracking-[0.2em] uppercase text-white/35 shrink-0"
        >
          <span
            className={`w-1 h-1 rounded-full ${it.live ? "j-breathe" : ""}`}
            style={{
              background: it.live ? "var(--j-signal-c)" : "rgba(255,255,255,0.18)",
            }}
          />
          {it.label}
          <span className="text-white/20">·</span>
          <span className={it.live ? "text-white/55" : "text-white/25"}>
            {it.state}
          </span>
        </span>
      ))}
      <span className="ml-auto j-label">Phase 03 — Voice</span>
    </div>
  );
}

export default function Dashboard({ user }: { user: JarvisUser }) {
  const [mode, setMode] = useState<Mode>("voice");
  // Open by default on desktop; closed (drawer) on mobile.
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(min-width: 768px)").matches
      : true
  );

  const stagger: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.1 + i * 0.14, duration: 0.8, ease: EASE },
    }),
  };

  return (
   <ConversationProvider>
    <div className="absolute inset-0 z-30 flex flex-col">
      <motion.div custom={0} variants={stagger} initial="hidden" animate="show">
        <HudPanel className="m-2 sm:m-4 !rounded-2xl" powerOn={false}>
          <TopBar user={user} onToggleSidebar={() => setSidebarOpen((o) => !o)} />
        </HudPanel>
      </motion.div>

      <div className="flex-1 flex gap-3 sm:gap-4 px-2 sm:px-4 min-h-0">
        <motion.div
          custom={1}
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex-1 min-w-0"
        >
          <HudPanel className="h-full" brackets>
            <div className="h-full flex flex-col p-3 sm:p-6">
              <div className="flex justify-center shrink-0 pb-3 sm:pb-5">
                <ModeToggle mode={mode} setMode={setMode} />
              </div>
              <div className="flex-1 min-h-0 relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, filter: "blur(8px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(8px)" }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {mode === "voice" ? (
                      <VoiceMode user={user} />
                    ) : (
                      <ChatMode user={user} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </HudPanel>
        </motion.div>

        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <motion.div custom={3} variants={stagger} initial="hidden" animate="show">
        <HudPanel className="m-2 sm:m-4 !rounded-2xl" powerOn={false}>
          <StatusBar />
        </HudPanel>
      </motion.div>
    </div>
   </ConversationProvider>
  );
}
