import { NextRequest } from "next/server";
import { DESIGN_SYSTEM_PROMPT } from "@/lib/fashion/design-prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Design-director brain: Google Gemini 2.5 Flash (free Google AI Studio), JSON
// mode. Native generateContent, mirroring the existing /api/z-chat integration.
// Free-tier models, tried in order; a quota/rate failure advances to the next.
const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash-lite"];
const MAX_TOKENS = 1024;
const MAX_MESSAGE_CHARS = 600;
const MAX_DESIGNS_CONTEXT = 12;

const PLACEMENTS = [
  "front_chest",
  "front_full",
  "back_center",
  "left_sleeve",
  "right_sleeve",
] as const;
const ACTIONS = ["add", "replace_all", "modify", "remove", "reject"] as const;
const SCALES = ["s", "m", "l"] as const;

// Gemini responseSchema (OpenAPI-subset: UPPERCASE types, no additionalProperties)
// — same §4.2 contract, expressed in Gemini's format so JSON is reliable.
// safeParse() below is still the defensive safety net.
const GEMINI_SCHEMA = {
  type: "OBJECT",
  properties: {
    action: { type: "STRING", enum: [...ACTIONS] },
    reject_reason: { type: "STRING" },
    designs: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          image_prompt: { type: "STRING" },
          placement: { type: "STRING", enum: [...PLACEMENTS] },
          scale: { type: "STRING", enum: [...SCALES] },
        },
        required: ["id", "image_prompt", "placement", "scale"],
        propertyOrdering: ["id", "image_prompt", "placement", "scale"],
      },
    },
    reply: { type: "STRING" },
  },
  required: ["action", "reject_reason", "designs", "reply"],
  propertyOrdering: ["action", "reject_reason", "designs", "reply"],
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

type WireDesign = {
  id: string;
  image_prompt: string;
  placement: (typeof PLACEMENTS)[number];
  scale: (typeof SCALES)[number];
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[fashion/design] GEMINI_API_KEY is not set");
    return json({ error: "unconfigured" }, 500);
  }

  const body = await req.json().catch(() => null);
  const userMessage =
    typeof body?.userMessage === "string" ? body.userMessage.trim() : "";
  if (!userMessage) return json({ error: "invalid_request" }, 400);

  const currentDesigns: WireDesign[] = Array.isArray(body?.currentDesigns)
    ? body.currentDesigns.slice(0, MAX_DESIGNS_CONTEXT)
    : [];

  // Volatile context goes in the user turn; the frozen system prompt is the
  // system_instruction.
  const designLines =
    currentDesigns
      .map(
        (d) =>
          `- id ${d?.id}: "${String(d?.image_prompt ?? "").slice(0, 160)}" @ ${d?.placement} (${d?.scale})`
      )
      .join("\n") || "(none yet)";
  const userContent = `CURRENT DESIGNS ON THE TEE:\n${designLines}\n\nOPERATOR REQUEST:\n${userMessage.slice(0, MAX_MESSAGE_CHARS)}`;

  const reqBody = JSON.stringify({
    system_instruction: { parts: [{ text: DESIGN_SYSTEM_PROMPT }] },
    contents: [{ role: "user", parts: [{ text: userContent }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: GEMINI_SCHEMA,
      temperature: 0.6,
      maxOutputTokens: MAX_TOKENS,
    },
  });

  let raw = "";
  let lastError: "rate_limit" | "server_error" = "server_error";

  for (let i = 0; i < MODELS.length; i++) {
    const model = MODELS[i];
    let resp: Response;
    try {
      resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: reqBody,
        }
      );
    } catch (err) {
      console.error("[fashion/design] fetch failed on", model, err);
      lastError = "server_error";
      break;
    }

    if (resp.ok) {
      const data = await resp.json().catch(() => null);
      raw =
        (data?.candidates?.[0]?.content?.parts as { text?: string }[] | undefined)
          ?.map((p) => p?.text || "")
          .join("")
          .trim() ?? "";
      // OK but empty (e.g. SAFETY / MAX_TOKENS finish with no text) → try the
      // next free model instead of failing the whole request.
      if (!raw && i < MODELS.length - 1) {
        console.error(
          "[fashion/design] empty candidate on",
          model,
          "finishReason:",
          data?.candidates?.[0]?.finishReason
        );
        lastError = "server_error";
        continue;
      }
      if (i > 0) console.info("[fashion/design] served via fallback model:", model);
      break;
    }

    const errText = await resp.text().catch(() => "");
    let apiStatus = "";
    try {
      apiStatus = (JSON.parse(errText)?.error?.status || "").toUpperCase();
    } catch {}
    const lower = errText.toLowerCase();
    const isQuota =
      apiStatus === "RESOURCE_EXHAUSTED" ||
      lower.includes("quota") ||
      lower.includes("exhaust");
    const isRate =
      resp.status === 429 || lower.includes("rate") || lower.includes("too many");
    // Transient Gemini hiccups (503 UNAVAILABLE / 500 INTERNAL / overloaded)
    // are common on the free tier — fall through to the next model instead of
    // failing the whole request.
    const isTransient =
      resp.status >= 500 ||
      apiStatus === "UNAVAILABLE" ||
      apiStatus === "INTERNAL" ||
      lower.includes("unavailable") ||
      lower.includes("overload") ||
      lower.includes("try again");
    console.error(
      "[fashion/design] Gemini error on",
      model,
      resp.status,
      apiStatus,
      errText.slice(0, 200)
    );
    if (isQuota || isRate) {
      lastError = "rate_limit";
      continue; // try the next free model
    }
    if (isTransient) {
      lastError = "server_error";
      continue; // transient — try the next free model
    }
    lastError = "server_error";
    break;
  }

  if (!raw) return json({ error: lastError }, lastError === "rate_limit" ? 429 : 502);

  // Defensive parse (SPEC §4.2): strip stray fences, validate, fall back.
  const parsed = safeParse(raw);
  if (!parsed) {
    console.error("[fashion/design] unparseable model output:", raw.slice(0, 300));
    return json({ error: "bad_response" }, 502);
  }
  return json(parsed);
}

function safeParse(raw: string): {
  action: (typeof ACTIONS)[number];
  reject_reason: string;
  designs: WireDesign[];
  reply: string;
} | null {
  let text = raw;
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();

  let obj: unknown;
  try {
    obj = JSON.parse(text);
  } catch {
    return null;
  }
  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;

  const action = (ACTIONS as readonly string[]).includes(o.action as string)
    ? (o.action as (typeof ACTIONS)[number])
    : "reject";
  const reply =
    typeof o.reply === "string" && o.reply.trim() ? o.reply.trim() : "Done.";
  const reject_reason =
    typeof o.reject_reason === "string" ? o.reject_reason : "";

  const designs: WireDesign[] = Array.isArray(o.designs)
    ? (o.designs as unknown[])
        .map((d) => {
          const dd = d as Record<string, unknown>;
          const placement = (PLACEMENTS as readonly string[]).includes(
            dd?.placement as string
          )
            ? (dd.placement as WireDesign["placement"])
            : "front_full";
          const scale = (SCALES as readonly string[]).includes(dd?.scale as string)
            ? (dd.scale as WireDesign["scale"])
            : "m";
          const id =
            typeof dd?.id === "string" && dd.id.trim() ? dd.id.trim() : "";
          const image_prompt =
            typeof dd?.image_prompt === "string" ? dd.image_prompt.trim() : "";
          return { id, image_prompt, placement, scale };
        })
        .filter((d) => d.id && (d.image_prompt || true))
    : [];

  return { action, reject_reason, designs, reply };
}
