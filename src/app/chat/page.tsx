"use client";

import { useState, useRef, useEffect, useCallback, FormEvent, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type ChatRole = "user" | "model";

type Message = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
};

type ErrorState =
  | { kind: "rate_limit" }
  | { kind: "quota_exhausted" }
  | { kind: "server_error" }
  | { kind: "empty_response" }
  | null;

const MAX_INPUT_LENGTH = 2000;
const WELCOME_MESSAGE = "I am Z. Ask me anything — strategy, philosophy, business, AI, or life. Let's think together.";

function formatRelativeTime(ts: number, now: number): string {
  const diff = Math.max(0, now - ts);
  const sec = Math.floor(diff / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  const regex = /(\*\*[^*\n]+?\*\*)|(`[^`\n]+`)|(\*[^*\n]+?\*)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(
        <strong key={key++} className="font-bold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`")) {
      parts.push(
        <code
          key={key++}
          className="px-1.5 py-[0.1em] rounded-md bg-white/[0.06] border border-white/[0.06] text-[0.88em] font-mono text-white/90"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else {
      parts.push(
        <em key={key++} className="italic text-white/85">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function renderMarkdown(text: string): React.ReactNode {
  const blocks = text.split(/\n\n+/);

  return blocks.map((block, bi) => {
    const lines = block.split("\n").filter((l) => l.length > 0);
    if (lines.length === 0) return null;

    const allNumbered = lines.every((l) => /^\d+\.\s+/.test(l.trim()));
    if (allNumbered) {
      return (
        <ol
          key={bi}
          className="list-decimal pl-5 my-3 space-y-2 marker:text-white/35 marker:font-mono marker:text-sm"
        >
          {lines.map((l, li) => (
            <li key={li} className="pl-1">
              {renderInline(l.trim().replace(/^\d+\.\s+/, ""))}
            </li>
          ))}
        </ol>
      );
    }

    const allBullets = lines.every((l) => /^[-*•]\s+/.test(l.trim()));
    if (allBullets) {
      return (
        <ul
          key={bi}
          className="list-disc pl-5 my-3 space-y-2 marker:text-white/35"
        >
          {lines.map((l, li) => (
            <li key={li} className="pl-1">
              {renderInline(l.trim().replace(/^[-*•]\s+/, ""))}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={bi} className="my-3 first:mt-0 last:mb-0">
        {lines.map((l, li) => (
          <span key={li}>
            {renderInline(l)}
            {li < lines.length - 1 && <br />}
          </span>
        ))}
      </p>
    );
  });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<ErrorState>(null);
  const [quotaExhausted, setQuotaExhausted] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const userScrolledUpRef = useRef(false);
  const lastUserMessageRef = useRef<Message | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const scrollToBottom = useCallback((smooth: boolean = true) => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
    userScrolledUpRef.current = false;
  }, []);

  useEffect(() => {
    if (!userScrolledUpRef.current) {
      scrollToBottom();
    }
  }, [messages, isThinking, scrollToBottom]);

  const handleScroll = () => {
    const c = messagesContainerRef.current;
    if (!c) return;
    const distanceFromBottom = c.scrollHeight - c.scrollTop - c.clientHeight;
    userScrolledUpRef.current = distanceFromBottom > 120;
  };

  const sendToZ = useCallback(
    async (history: Message[]) => {
      setError(null);
      setIsThinking(true);

      try {
        const payload = {
          history: history.map((m) => ({
            role: m.role,
            parts: [{ text: m.content }],
          })),
        };

        const res = await fetch("/api/z-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data: { reply?: string; error?: string } = await res
          .json()
          .catch(() => ({ error: "server_error" }));

        if (!res.ok || data.error) {
          switch (data.error) {
            case "rate_limit":
              setError({ kind: "rate_limit" });
              break;
            case "quota_exhausted":
              setError({ kind: "quota_exhausted" });
              setQuotaExhausted(true);
              break;
            case "empty_response":
              setError({ kind: "empty_response" });
              break;
            default:
              setError({ kind: "server_error" });
          }
          return;
        }

        if (!data.reply) {
          setError({ kind: "empty_response" });
          return;
        }

        const zMessage: Message = {
          id: makeId(),
          role: "model",
          content: data.reply,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, zMessage]);
      } catch {
        setError({ kind: "server_error" });
      } finally {
        setIsThinking(false);
      }
    },
    []
  );

  const handleSend = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isThinking || quotaExhausted) return;
    if (trimmed.length > MAX_INPUT_LENGTH) return;

    const userMsg: Message = {
      id: makeId(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };
    lastUserMessageRef.current = userMsg;
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    userScrolledUpRef.current = false;
    sendToZ(nextHistory);
  };

  const handleRetry = () => {
    setError(null);
    if (messages.length === 0) return;
    sendToZ(messages);
  };

  const handleClearChat = () => {
    if (messages.length === 0) {
      setError(null);
      return;
    }
    setShowClearConfirm(true);
  };

  const confirmClear = () => {
    setMessages([]);
    setError(null);
    setShowClearConfirm(false);
    lastUserMessageRef.current = null;
    userScrolledUpRef.current = false;
  };

  const cancelClear = () => setShowClearConfirm(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value.slice(0, MAX_INPUT_LENGTH));
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  };

  const charCount = input.length;
  const showCharCount = charCount > MAX_INPUT_LENGTH - 200;
  const remaining = MAX_INPUT_LENGTH - charCount;
  const inputDisabled = isThinking || quotaExhausted;

  return (
    <main className="relative h-[100dvh] bg-black flex flex-col overflow-hidden font-inter">
      <div className="absolute top-[10%] -right-32 w-[500px] h-[500px] rounded-full bg-violet-500/[0.05] blur-3xl pointer-events-none" />
      <div className="absolute bottom-[15%] -left-32 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.04] blur-3xl pointer-events-none" />

      <header className="relative z-20 flex items-center justify-between px-5 sm:px-8 py-4 border-b border-white/[0.06]">
        <Link href="/" className="group flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <h1 className="font-walsheim text-3xl sm:text-4xl font-bold text-white leading-none tracking-tight">
              Z
            </h1>
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="absolute -right-2 -top-0.5 w-1 h-1 rounded-full bg-emerald-400"
            />
          </div>
          <div className="hidden sm:block h-7 w-px bg-white/[0.08]" />
          <div className="hidden sm:flex flex-col leading-tight">
            <p className="text-[11px] font-mono text-white/35 tracking-[0.25em] uppercase">
              Intelligence
            </p>
            <p className="text-xs text-white/55 italic font-light">
              with a conscience.
            </p>
          </div>
        </Link>

        <button
          onClick={handleClearChat}
          className="group flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04] transition-all text-[11px] sm:text-xs font-medium text-white/70 hover:text-white"
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 1v10M1 6h10" />
          </svg>
          <span>New Chat</span>
        </button>
      </header>

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        data-lenis-prevent
        className="relative z-10 flex-1 overflow-y-auto overscroll-contain hide-scrollbar"
      >
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 sm:py-12 min-h-full flex flex-col">
          {messages.length === 0 && !isThinking && !error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-xl"
              >
                <div className="flex items-center justify-center gap-3 mb-6 font-mono">
                  <div className="w-8 h-px bg-white/20" />
                  <p className="text-[10px] sm:text-xs text-white/45 tracking-[0.3em] uppercase">
                    Welcome
                  </p>
                  <div className="w-8 h-px bg-white/20" />
                </div>
                <p className="font-walsheim text-2xl sm:text-3xl md:text-[2.25rem] font-bold text-white leading-[1.25] tracking-tight mb-4">
                  {WELCOME_MESSAGE}
                </p>
                <p className="text-[11px] sm:text-xs text-white/35 font-mono tracking-[0.2em] uppercase mt-8">
                  Type below to begin
                </p>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-7 sm:space-y-9 flex-1">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
                  >
                    {m.role === "user" ? (
                      <div className="max-w-[85%] sm:max-w-[78%]">
                        <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl rounded-tr-md px-4 sm:px-5 py-3 text-white text-[14.5px] leading-[1.55] whitespace-pre-wrap break-words">
                          {m.content}
                        </div>
                        <p className="text-[10px] text-white/30 font-mono tracking-[0.18em] uppercase mt-1.5 text-right">
                          You · {formatRelativeTime(m.timestamp, now)}
                        </p>
                      </div>
                    ) : (
                      <div className="max-w-[92%] sm:max-w-[85%]">
                        <p className="text-[10px] text-white/45 font-mono tracking-[0.25em] uppercase mb-2 flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-emerald-400" />
                          Z · {formatRelativeTime(m.timestamp, now)}
                        </p>
                        <div className="text-white/85 text-[15px] leading-[1.65] break-words font-light z-prose">
                          {renderMarkdown(m.content)}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[85%]">
                    <p className="text-[10px] text-white/45 font-mono tracking-[0.25em] uppercase mb-2 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                      Z · thinking
                    </p>
                    <div className="flex items-center gap-1.5 py-2">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                          className="w-1.5 h-1.5 rounded-full bg-white/70"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[92%] sm:max-w-[85%] bg-rose-500/[0.04] border border-rose-400/15 rounded-2xl px-4 sm:px-5 py-3.5">
                    <p className="text-[10px] text-rose-300/70 font-mono tracking-[0.25em] uppercase mb-1.5">
                      Z · notice
                    </p>
                    <p className="text-white/80 text-[14px] leading-[1.55]">
                      {error.kind === "rate_limit" && "Z is receiving too many requests right now. Please wait a moment and try again."}
                      {error.kind === "quota_exhausted" && "Z has reached its daily limit. Please come back tomorrow."}
                      {error.kind === "server_error" && "Something went wrong. Please try again."}
                      {error.kind === "empty_response" && "Z couldn't generate a response. Please try rephrasing your question."}
                    </p>
                    {(error.kind === "server_error" || error.kind === "rate_limit") && (
                      <button
                        onClick={handleRetry}
                        className="mt-3 text-[11px] font-mono tracking-[0.2em] uppercase text-rose-300 hover:text-white transition-colors flex items-center gap-1.5"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 6a4 4 0 11-1.17-2.83M10 2v2H8" />
                        </svg>
                        Retry
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <footer className="relative z-20 border-t border-white/[0.06] bg-black/60 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-4 sm:py-5">
          <form
            onSubmit={handleSend}
            className={`relative flex items-end gap-2.5 bg-white/[0.03] border rounded-2xl pl-4 pr-2.5 py-2.5 transition-all ${
              inputDisabled
                ? "border-white/[0.05] opacity-60"
                : "border-white/[0.08] focus-within:border-white/25 focus-within:bg-white/[0.05] focus-within:shadow-[0_0_30px_rgba(255,255,255,0.06)]"
            }`}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={quotaExhausted ? "Z is offline for the day." : "Ask Z anything..."}
              disabled={inputDisabled}
              rows={1}
              className="flex-1 bg-transparent text-white text-[14.5px] leading-[1.5] placeholder:text-white/30 focus:outline-none resize-none py-1.5 max-h-[180px]"
            />
            <button
              type="submit"
              disabled={inputDisabled || !input.trim()}
              className="shrink-0 w-9 h-9 rounded-xl bg-white text-black hover:bg-white/95 disabled:bg-white/15 disabled:text-white/40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              aria-label="Send message"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 12V2M2 7l5-5 5 5" />
              </svg>
            </button>
          </form>

          <div className="flex items-center justify-between mt-2.5 text-[10px] font-mono tracking-[0.18em] uppercase">
            <p className="text-white/25">
              Z is powered by AI and may not always be accurate.
            </p>
            {showCharCount && !inputDisabled && (
              <p className={remaining < 0 ? "text-rose-400" : "text-white/35"}>
                {remaining} left
              </p>
            )}
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-5"
            onClick={cancelClear}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-zinc-950 border border-white/[0.08] rounded-2xl p-6 sm:p-7 max-w-sm w-full"
            >
              <p className="font-walsheim text-xl font-bold text-white mb-2 tracking-tight">
                Start a new chat?
              </p>
              <p className="text-white/55 text-sm leading-relaxed font-light mb-6">
                This will clear the current conversation. Z will not remember anything that was said.
              </p>
              <div className="flex items-center gap-2.5 justify-end">
                <button
                  onClick={cancelClear}
                  className="px-4 py-2 text-xs font-medium text-white/65 hover:text-white transition-colors rounded-full"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClear}
                  className="px-4 py-2 text-xs font-medium bg-white text-black rounded-full hover:bg-white/95 transition-colors"
                >
                  Clear chat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
