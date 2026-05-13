import { NextRequest, NextResponse } from "next/server";
import { Z_SYSTEM_PROMPT } from "@/lib/z-prompt";

type GeminiRole = "user" | "model";

type GeminiMessage = {
  role: GeminiRole;
  parts: { text: string }[];
};

// Free-tier eligible models, tried in order. If one is quota-exhausted, the next is tried.
// gemini-2.5-flash → main free model (10 RPM, ~250 RPD)
// gemini-2.5-flash-lite → lighter, also free
// gemini-2.0-flash-lite → older fallback
const MODEL_FALLBACKS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash-lite"];

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[z-chat] GEMINI_API_KEY is not set");
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.history) || body.history.length === 0) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    const history = (body.history as GeminiMessage[]).filter(
      (m) => m && (m.role === "user" || m.role === "model") && Array.isArray(m.parts)
    );

    if (history.length === 0) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    let lastErrorKind: "rate_limit" | "quota_exhausted" | "server_error" = "server_error";

    for (let i = 0; i < MODEL_FALLBACKS.length; i++) {
      const model = MODEL_FALLBACKS[i];

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: Z_SYSTEM_PROMPT }] },
            contents: history,
            generationConfig: {
              temperature: 0.85,
              topP: 0.92,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const reply: string | undefined = data?.candidates?.[0]?.content?.parts
          ?.map((p: { text?: string }) => p?.text || "")
          .join("")
          .trim();

        if (!reply) {
          const finishReason = data?.candidates?.[0]?.finishReason;
          console.warn("[z-chat] Empty reply on", model, "finishReason:", finishReason);
          return NextResponse.json({ error: "empty_response" }, { status: 200 });
        }

        if (i > 0) {
          console.info("[z-chat] Served via fallback model:", model);
        }
        return NextResponse.json({ reply });
      }

      const raw = await response.text();
      let parsed: { error?: { message?: string; status?: string; code?: number } } = {};
      try {
        parsed = JSON.parse(raw);
      } catch {}

      const message = (parsed?.error?.message || "").toLowerCase();
      const status = (parsed?.error?.status || "").toUpperCase();

      console.error("[z-chat] Gemini API error on", model, ":", {
        httpStatus: response.status,
        apiStatus: status,
        message: parsed?.error?.message,
      });

      const looksLikeQuota =
        message.includes("quota") ||
        message.includes("exhaust") ||
        status === "RESOURCE_EXHAUSTED";

      const looksLikeRateLimit =
        message.includes("rate") ||
        message.includes("too many") ||
        (response.status === 429 && !looksLikeQuota);

      if (looksLikeQuota) {
        lastErrorKind = "quota_exhausted";
        // Try next model in the fallback chain
        continue;
      }
      if (looksLikeRateLimit) {
        lastErrorKind = "rate_limit";
        continue;
      }

      lastErrorKind = "server_error";
      break;
    }

    return NextResponse.json(
      { error: lastErrorKind },
      { status: lastErrorKind === "server_error" ? 502 : 429 }
    );
  } catch (err) {
    console.error("[z-chat] Unexpected error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
