import type { Metadata, Viewport } from "next";
import { Oswald, DM_Sans } from "next/font/google";
import "./globals.css";
import { brand } from "@/data/brand";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${brand.name} · Order at your table`,
  description: `${brand.tagline} — scan, order, enjoy.`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f1e3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${oswald.variable} ${dmSans.variable} antialiased`}>
      <body>
        {/* Phone-first: constrain to a phone column even on desktop */}
        <div className="mx-auto min-h-dvh max-w-md">{children}</div>
      </body>
    </html>
  );
}
