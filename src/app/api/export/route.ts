import { NextRequest } from "next/server";
import sharp from "sharp";
import JSZip from "jszip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // sharp upscales several large PNGs

// Phase 4 — print export. Each on-tee graphic (already a cut-out transparent
// PNG) is upscaled to ~300 DPI at the real print size for its placement and
// zipped up as print-ready files. Free Lanczos upscale (sharp) — a ~1024px
// source blown up to 4800px is genuinely soft on fine detail; bold streetwear
// graphics hold up well. No flat preview (per scope).
const DPI = 300;
const MAX_DESIGNS = 8;
const MAX_PX = 6000; // ~20" @ 300 DPI — safety clamp

// Real print long-edge size (inches) per zone, at scaleFactor = 1.
const PRINT_INCHES: Record<string, number> = {
  front_full: 16,
  back_center: 16,
  front_chest: 4.5,
  left_sleeve: 4,
  right_sleeve: 4,
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
function safeName(s: string) {
  return s.replace(/[^a-z0-9_-]/gi, "").slice(0, 24) || "design";
}

type InDesign = {
  id?: string;
  image?: string;
  placement?: string;
  scaleFactor?: number;
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const incoming: InDesign[] = Array.isArray(body?.designs)
    ? body.designs.slice(0, MAX_DESIGNS)
    : [];

  const designs = incoming.filter(
    (d) =>
      d &&
      typeof d.image === "string" &&
      d.image.startsWith("data:image") &&
      typeof d.placement === "string" &&
      d.placement in PRINT_INCHES
  );
  if (designs.length === 0) {
    return json(
      { error: "invalid_request", message: "No exportable designs." },
      400
    );
  }

  try {
    const zip = new JSZip();
    let added = 0;

    for (let i = 0; i < designs.length; i++) {
      const d = designs[i];
      try {
        const b64 = (d.image as string).split(",")[1] ?? "";
        const inputBuf = Buffer.from(b64, "base64");
        const inches = PRINT_INCHES[d.placement as string];
        const factor = clamp(
          typeof d.scaleFactor === "number" ? d.scaleFactor : 1,
          0.4,
          1.8
        );
        const longEdge = Math.min(MAX_PX, Math.round(inches * DPI * factor));

        const out = await sharp(inputBuf)
          .trim() // drop the transparent margin so the art fills the file
          .resize({
            width: longEdge,
            height: longEdge,
            fit: "inside",
            withoutEnlargement: false,
            kernel: "lanczos3",
          })
          .png({ compressionLevel: 9 })
          .withMetadata({ density: DPI }) // tag the file as 300 DPI for the printer
          .toBuffer();

        const meta = await sharp(out).metadata();
        const wpx = meta.width ?? longEdge;
        const name = `z-print__${d.placement}__${safeName(d.id || `d${i + 1}`)}__${wpx}px_300dpi.png`;
        zip.file(name, out);
        added++;
      } catch (err) {
        console.error("[fashion/export] skipped a design", err);
      }
    }

    if (added === 0) return json({ error: "export_failed" }, 502);

    const zipBuf = await zip.generateAsync({ type: "nodebuffer" });
    return new Response(new Uint8Array(zipBuf), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="z-print-files.zip"',
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[fashion/export] failed", err);
    return json({ error: "export_failed" }, 502);
  }
}
