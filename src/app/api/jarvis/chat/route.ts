import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { JARVIS_SYSTEM_PROMPT } from "@/lib/jarvis/jarvis-prompt";
import { rateLimit } from "@/lib/jarvis/ratelimit";
import { getSessionUser } from "@/lib/jarvis/session";

// SDK + in-memory rate state need the Node runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Your choice: Sonnet 4.6. Exact ID, no date suffix. One-line swap to
// change models later.
const MODEL = "claude-sonnet-4-6";

// Cost caps (zero-budget guard):
const MAX_TOKENS = 1024; // JARVIS is concise; this bounds output cost
const MAX_HISTORY = 24; // only the last N turns are sent
const MAX_CHARS_PER_MSG = 8000; // trim runaway pasted blobs

type WireMsg = { role: "user" | "assistant"; content: string };

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "local";
}

function sse(obj: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(obj)}\n\n`);
}

export async function POST(req: NextRequest) {
  // 0. Auth gate — no valid session cookie, no access. Blocks direct
  //    API hits that never passed the key screen.
  if (!getSessionUser(req)) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ip = clientIp(req);

  // 1. Rate limit before doing any paid work.
  const rl = rateLimit(ip);
  if (!rl.allowed) {
    return new Response(
      JSON.stringify({ error: "rate_limit", retryAfter: rl.retryAfter }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. Key check — fail clearly so Aimaan knows to set it.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[jarvis/chat] ANTHROPIC_API_KEY is not set");
    return new Response(JSON.stringify({ error: "unconfigured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 3. Parse + validate the conversation.
  const body = await req.json().catch(() => null);
  const operator: string =
    body?.operator === "Zaid" || body?.operator === "Aimaan"
      ? body.operator
      : "Operator";
  const rawHistory: unknown = body?.messages;
  if (!Array.isArray(rawHistory) || rawHistory.length === 0) {
    return new Response(JSON.stringify({ error: "invalid_request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Sanitize + cap history (cost + context guard).
  const history: WireMsg[] = rawHistory
    .filter(
      (m): m is WireMsg =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .slice(-MAX_HISTORY)
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, MAX_CHARS_PER_MSG),
    }));

  if (history.length === 0 || history[0].role !== "user") {
    return new Response(JSON.stringify({ error: "invalid_request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const client = new Anthropic({ apiKey });

  // Per-request context lives in its OWN system block with NO
  // cache_control — so the big frozen prompt above stays byte-stable
  // and keeps hitting the prompt cache.
  const now = new Date();
  const contextBlock =
    `Current operator signed in: ${operator}. ` +
    `Server time: ${now.toISOString()}. ` +
    `Greet only on the very first message of a conversation, not every turn.`;

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    // Chat workload: no thinking + low effort = fastest + cheapest
    // (the skill's explicit recommendation for chat on Sonnet 4.6).
    thinking: { type: "disabled" },
    output_config: { effort: "low" },
    system: [
      {
        type: "text",
        text: JARVIS_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" }, // cached prefix
      },
      { type: "text", text: contextBlock }, // volatile, uncached
    ],
    messages: history.map((m) => ({ role: m.role, content: m.content })),
  });

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        stream.on("text", (delta: string) => {
          controller.enqueue(sse({ t: "delta", v: delta }));
        });
        const final = await stream.finalMessage();
        controller.enqueue(
          sse({
            t: "done",
            usage: {
              in: final.usage.input_tokens,
              out: final.usage.output_tokens,
              cache_read: final.usage.cache_read_input_tokens ?? 0,
            },
          })
        );
      } catch (err) {
        let kind = "server_error";
        if (err instanceof Anthropic.RateLimitError) kind = "rate_limit";
        else if (err instanceof Anthropic.AuthenticationError)
          kind = "unconfigured";
        else if (err instanceof Anthropic.APIError)
          console.error("[jarvis/chat] Anthropic error", err.status, err.message);
        else console.error("[jarvis/chat] Unexpected error", err);
        controller.enqueue(sse({ t: "error", kind }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
