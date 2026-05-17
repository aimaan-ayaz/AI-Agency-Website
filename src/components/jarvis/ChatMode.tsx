"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  FormEvent,
  KeyboardEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import JarvisMarkdown from "./ui/JarvisMarkdown";

type JarvisUser = "Aimaan" | "Zaid";
type Role = "user" | "assistant";
type Msg = { id: string; role: Role; content: string };
type ErrKind =
  | "rate_limit"
  | "server_error"
  | "unconfigured"
  | "unauthorized"
  | null;

const EASE = [0.22, 1, 0.36, 1] as const;
const MAX_INPUT = 4000;

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function ChatMode({ user }: { user: JarvisUser }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<ErrKind>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const atBottomRef = useRef(true);

  const scrollToEnd = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (el)
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  useEffect(() => {
    if (atBottomRef.current) scrollToEnd();
  }, [messages, streaming, scrollToEnd]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    atBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  const send = useCallback(
    async (history: Msg[]) => {
      setError(null);
      setStreaming(true);
      const assistantId = uid();
      // Placeholder assistant message we append streamed text into.
      setMessages((p) => [...p, { id: assistantId, role: "assistant", content: "" }]);

      try {
        const res = await fetch("/api/jarvis/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operator: user,
            messages: history.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          throw { kind: data?.error ?? "server_error" };
        }

        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";

        // Parse the SSE stream: `data: {json}\n\n` frames.
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const frames = buf.split("\n\n");
          buf = frames.pop() ?? "";
          for (const f of frames) {
            const line = f.trim();
            if (!line.startsWith("data:")) continue;
            const evt = JSON.parse(line.slice(5).trim());
            if (evt.t === "delta") {
              setMessages((p) =>
                p.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + evt.v }
                    : m
                )
              );
            } else if (evt.t === "error") {
              throw { kind: evt.kind ?? "server_error" };
            }
            // evt.t === "done" → nothing to do; loop ends on reader done
          }
        }
      } catch (e: unknown) {
        const ek = (e as { kind?: string })?.kind;
        const kind =
          ek === "rate_limit"
            ? "rate_limit"
            : ek === "unconfigured"
            ? "unconfigured"
            : ek === "unauthorized"
            ? "unauthorized"
            : "server_error";
        setError(kind as ErrKind);
        // Drop the empty assistant placeholder if nothing streamed.
        setMessages((p) =>
          p.filter((m) => !(m.id === assistantId && m.content === ""))
        );
      } finally {
        setStreaming(false);
      }
    },
    [user]
  );

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;
    const userMsg: Msg = { id: uid(), role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";
    atBottomRef.current = true;
    send(next);
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const onInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value.slice(0, MAX_INPUT));
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  const lastId = messages[messages.length - 1]?.id;

  return (
    <div className="w-full h-full flex flex-col max-w-3xl mx-auto">
      {/* Transcript */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        data-lenis-prevent
        className="flex-1 overflow-y-auto j-scroll px-1 pt-2"
      >
        {messages.length === 0 && !streaming && !error ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3">
            <span
              className="w-1.5 h-1.5 rounded-full j-breathe"
              style={{ background: "var(--j-signal-c)" }}
            />
            <p className="font-walsheim text-lg text-white/80">
              JARVIS online.
            </p>
            <p className="j-label">Ask anything, {user}</p>
          </div>
        ) : (
          <div className="space-y-7 pb-4">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className={
                    m.role === "user" ? "flex justify-end" : "flex justify-start"
                  }
                >
                  {m.role === "user" ? (
                    <div className="max-w-[80%]">
                      <div
                        className="px-4 py-2.5 rounded-2xl rounded-tr-md font-inter text-[14.5px] leading-[1.6] text-white/90 whitespace-pre-wrap break-words"
                        style={{
                          background: "rgba(255,255,255,0.045)",
                          border: "1px solid var(--j-line)",
                        }}
                      >
                        {m.content}
                      </div>
                      <p className="j-label text-right mt-1.5">
                        {user}
                      </p>
                    </div>
                  ) : (
                    <div className="max-w-[88%] pl-4 relative">
                      <span
                        className="absolute left-0 top-1 bottom-1 w-px"
                        style={{
                          background:
                            "linear-gradient(180deg,rgba(255,255,255,0.5),rgba(255,255,255,0.05))",
                        }}
                      />
                      <p className="j-label mb-2 flex items-center gap-2">
                        <span
                          className="w-1 h-1 rounded-full j-breathe"
                          style={{ background: "var(--j-signal-c)" }}
                        />
                        JARVIS
                      </p>
                      <div className="font-inter text-[15px] leading-[1.7] text-white/80">
                        <JarvisMarkdown text={m.content} />
                        {streaming && m.id === lastId && (
                          <span className="j-caret" />
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {streaming &&
              messages[messages.length - 1]?.content === "" && (
                <div className="flex justify-start">
                  <div className="pl-4">
                    <p className="j-label flex items-center gap-2">
                      <span
                        className="w-1 h-1 rounded-full j-breathe"
                        style={{ background: "var(--j-signal-c)" }}
                      />
                      JARVIS · processing
                    </p>
                  </div>
                </div>
              )}

            {error && (
              <div className="flex justify-start">
                <div
                  className="px-4 py-3 rounded-2xl max-w-[88%]"
                  style={{
                    background: "rgba(217,107,107,0.05)",
                    border: "1px solid rgba(217,107,107,0.2)",
                  }}
                >
                  <p className="j-label mb-1" style={{ color: "var(--j-danger)" }}>
                    JARVIS · notice
                  </p>
                  <p className="font-inter text-[13.5px] text-white/70 leading-relaxed">
                    {error === "rate_limit" &&
                      "Too many requests in a short window. Give it a moment."}
                    {error === "unconfigured" &&
                      "Claude API key not set on the server. Add ANTHROPIC_API_KEY to .env.local and restart the dev server."}
                    {error === "unauthorized" &&
                      "Session expired. Reload the page and re-enter your access key."}
                    {error === "server_error" &&
                      "Something went wrong reaching Claude. Try again."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={submit}
        className="mt-4 flex items-end gap-3 px-4 py-3 rounded-2xl j-ease transition-colors"
        style={{
          background: "var(--j-elev)",
          border: "1px solid var(--j-line)",
        }}
      >
        <textarea
          ref={taRef}
          value={input}
          onChange={onInput}
          onKeyDown={onKey}
          rows={1}
          placeholder={streaming ? "JARVIS is responding…" : "Message JARVIS"}
          disabled={streaming}
          className="flex-1 bg-transparent resize-none outline-none font-inter text-[14.5px] leading-[1.5] text-white/90 placeholder:text-white/25 max-h-[140px] j-scroll disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          aria-label="Send"
          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center j-ease transition-all disabled:opacity-25 disabled:cursor-not-allowed hover:scale-105"
          style={{ background: "#fff", color: "#0a0a0b" }}
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 12V2M2 7l5-5 5 5" />
          </svg>
        </button>
      </form>
      <p className="j-label text-center mt-3 opacity-60">
        JARVIS · Claude Sonnet 4.6 · may be imprecise
      </p>
    </div>
  );
}
