import { NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Serves the pre-built static export of the standalone "Sidewalk Demo" app
// (a separate Next.js project living in ../Sidewalk Demo/sidewalk-demo).
// This file is the only piece of glue on the main site — everything else
// (markup, JS, assets) is read straight out of that folder's `out/` build.
// Deleting "Sidewalk Demo" removes the demo entirely; this route just starts
// 404ing.
const DEMO_ROOT = path.join(process.cwd(), "Sidewalk Demo", "sidewalk-demo", "out");

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

async function readDemoFile(relPath: string): Promise<{ data: Buffer; ext: string } | null> {
  const filePath = path.join(DEMO_ROOT, relPath);
  if (!filePath.startsWith(DEMO_ROOT)) return null; // guard against path escape
  try {
    const data = await readFile(filePath);
    return { data, ext: path.extname(filePath) };
  } catch {
    return null;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug?: string[] } }
) {
  const relPath = !params.slug || params.slug.length === 0 ? "index.html" : params.slug.join("/");

  const found = (await readDemoFile(relPath)) ?? (await readDemoFile(`${relPath}.html`));
  if (found) {
    return new Response(new Uint8Array(found.data), {
      headers: { "Content-Type": MIME_TYPES[found.ext] ?? "application/octet-stream" },
    });
  }

  const notFound = await readDemoFile("404.html");
  if (notFound) {
    return new Response(new Uint8Array(notFound.data), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
  return new Response("Not found", { status: 404 });
}
