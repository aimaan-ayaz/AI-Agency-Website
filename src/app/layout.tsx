import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { NoiseOverlay } from "@/components/ui/NoiseOverlay";
import { CTAProvider } from "@/lib/cta-context";

export const metadata: Metadata = {
  title: "Zaid AI Agency",
  description: "Everything You Need to Launch, Grow, and Automate — Built for You.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark font-sans">
      <body className="antialiased min-h-screen bg-background text-foreground overflow-x-hidden">
        <CTAProvider>
          <SmoothScroll>
            <NoiseOverlay />
            <CustomCursor />
            {children}
          </SmoothScroll>
        </CTAProvider>
      </body>
    </html>
  );
}
