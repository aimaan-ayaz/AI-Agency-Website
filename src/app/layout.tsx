import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { NoiseOverlay } from "@/components/ui/NoiseOverlay";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

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
    <html lang="en" className={cn("dark font-sans", inter.variable)}>
      <head>
        <link rel="preload" href="/scene.splinecode" as="fetch" crossOrigin="anonymous" />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground overflow-x-hidden">
        <SmoothScroll>
          <NoiseOverlay />
          <CustomCursor />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
