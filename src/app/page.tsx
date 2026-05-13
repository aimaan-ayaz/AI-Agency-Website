import { BGPattern } from "@/components/bg-pattern";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import { DeferredMount } from "@/components/DeferredMount";
import dynamic from "next/dynamic";

const TrustBar = dynamic(() => import("@/components/TrustBar"));
const AboutPanel = dynamic(() => import("@/components/AboutPanel"));
const ServicesShowcase = dynamic(() => import("@/components/ServicesShowcase"));
const ConnectCTA = dynamic(() => import("@/components/ConnectCTA"));
const Footer = dynamic(() => import("@/components/Footer"));
const ScrollHUD = dynamic(() => import("@/components/ScrollHUD"), { ssr: false });

export default function Home() {
  return (
    <main className="relative bg-[#0a0a0b] min-h-screen">
      <div className="fixed inset-0 z-0 pointer-events-none hidden md:block">
        <BGPattern variant="dots" fill="rgba(255, 255, 255, 0.06)" mask="fade-right" />
      </div>

      <Navbar />

      <div className="relative z-10">
        <HeroSection />
        <DeferredMount>
          <ScrollHUD />
          <TrustBar />
          <AboutPanel />
          <ServicesShowcase />
          <ConnectCTA />
          <Footer />
        </DeferredMount>
      </div>
    </main>
  );
}
