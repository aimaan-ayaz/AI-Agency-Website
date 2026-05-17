"use client";

import { ReactNode } from "react";

// Minimal, monochrome markdown — shared by Chat and Voice modes so
// JARVIS reads identically everywhere. Bold / italic / inline code /
// fenced code / ordered + unordered lists / paragraphs. No decoration.

function inline(text: string, k: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*\n]+\*\*)|(`[^`\n]+`)|(\*[^*\n]+\*)/g;
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    if (t.startsWith("**"))
      out.push(
        <strong key={`${k}-${i++}`} className="text-white font-semibold">
          {t.slice(2, -2)}
        </strong>
      );
    else if (t.startsWith("`"))
      out.push(
        <code
          key={`${k}-${i++}`}
          className="j-mono text-[0.85em] px-1.5 py-0.5 rounded-md"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid var(--j-line)",
          }}
        >
          {t.slice(1, -1)}
        </code>
      );
    else
      out.push(
        <em key={`${k}-${i++}`} className="italic text-white/80">
          {t.slice(1, -1)}
        </em>
      );
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function JarvisMarkdown({ text }: { text: string }) {
  const blocks = text.split(/\n\n+/);
  return (
    <>
      {blocks.map((b, bi) => {
        if (b.startsWith("```")) {
          const body = b.replace(/^```[^\n]*\n?/, "").replace(/```$/, "");
          return (
            <pre
              key={bi}
              className="j-mono text-[12.5px] leading-relaxed my-3 p-3.5 rounded-xl overflow-x-auto j-scroll"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--j-line)",
              }}
            >
              <code>{body}</code>
            </pre>
          );
        }
        const lines = b.split("\n").filter((l) => l.trim().length > 0);
        if (lines.length && lines.every((l) => /^\d+\.\s+/.test(l.trim())))
          return (
            <ol
              key={bi}
              className="list-decimal pl-5 my-2.5 space-y-1.5 marker:text-white/30"
            >
              {lines.map((l, li) => (
                <li key={li}>
                  {inline(l.trim().replace(/^\d+\.\s+/, ""), `${bi}-${li}`)}
                </li>
              ))}
            </ol>
          );
        if (lines.length && lines.every((l) => /^[-*•]\s+/.test(l.trim())))
          return (
            <ul
              key={bi}
              className="list-disc pl-5 my-2.5 space-y-1.5 marker:text-white/25"
            >
              {lines.map((l, li) => (
                <li key={li}>
                  {inline(l.trim().replace(/^[-*•]\s+/, ""), `${bi}-${li}`)}
                </li>
              ))}
            </ul>
          );
        return (
          <p key={bi} className="my-2.5 first:mt-0 last:mb-0">
            {lines.map((l, li) => (
              <span key={li}>
                {inline(l, `${bi}-${li}`)}
                {li < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}
