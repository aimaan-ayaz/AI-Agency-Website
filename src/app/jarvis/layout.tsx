import type { Metadata } from "next";
import "./jarvis.css";

// JARVIS is private. Keep it out of search engines and link previews.
export const metadata: Metadata = {
  title: "JARVIS",
  robots: { index: false, follow: false, nocache: true },
};

export default function JarvisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // `.jarvis-root` is a fixed, fully isolated surface. Typography reuses
  // the site's globally-loaded faces (Inter / GT Walsheim / Blanka) via
  // the global `.font-*` utilities, so JARVIS feels like the same brand.
  return <div className="jarvis-root font-inter">{children}</div>;
}
