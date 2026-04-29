import { BGPattern } from "@/components/bg-pattern";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import dynamic from "next/dynamic";

const ServicesScrollytelling = dynamic(() => import("@/components/ServicesScrollytelling"));
const ContactFooter = dynamic(() => import("@/components/ContactFooter"));

export default function Home() {
  return (
    <main className="relative bg-black min-h-screen">
      <div className="fixed inset-0 z-0 pointer-events-none hidden md:block">
        <BGPattern variant="dots" fill="rgba(255, 255, 255, 0.18)" mask="fade-right" />
      </div>
      
      <Navbar />
      
      <div className="relative z-10">
        <HeroSection />
        <ServicesScrollytelling />
        <ContactFooter />
      </div>
    </main>
  );
}
