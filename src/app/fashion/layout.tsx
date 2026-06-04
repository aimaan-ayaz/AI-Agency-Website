import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Z — Fashion Studio",
  description:
    "Design a one-of-one tee. Your graphic, printed into the fabric of a premium 3D shirt.",
};

// Full-screen 3D stage: lock page zoom so pinch gestures drive the tee's
// OrbitControls instead of zooming the document.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function FashionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Isolated full-viewport stage. The global Lenis smooth-scroll is opted out
  // for /fashion in SmoothScroll.tsx so it can't swallow OrbitControls' wheel.
  return <div className="fashion-root">{children}</div>;
}
