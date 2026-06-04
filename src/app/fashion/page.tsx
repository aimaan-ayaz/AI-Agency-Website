"use client";

import dynamic from "next/dynamic";

// Three.js is client-only and code-split into /fashion, never touching the
// marketing or JARVIS bundles.
const Studio = dynamic(() => import("@/components/fashion/Studio"), {
  ssr: false,
  // Light, branded loader that matches the storefront (no jarring black flash,
  // reads as a shop opening — not an engine booting).
  loading: () => (
    <div
      className="flex h-[100dvh] w-full flex-col items-center justify-center gap-5"
      style={{
        background:
          "radial-gradient(115% 105% at 50% 30%, #e7e3da 0%, #dbd7ce 48%, #c6c1b6 100%)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/zaid-wordmark.png"
        alt="ZAID"
        className="h-6 w-auto animate-pulse"
        style={{ filter: "brightness(0)" }}
      />
      <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#17171a]/40">
        Preparing your tee
      </div>
    </div>
  ),
});

export default function FashionPage() {
  return <Studio />;
}
