"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCTA } from "@/lib/cta-context";
import HoverSlideText from "@/components/HoverSlideText";

export default function Navbar() {
  const router = useRouter();
  const { isCTAInView } = useCTA();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className="entry-slide-down fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 sm:px-8 lg:px-12 py-3 sm:py-5 mix-blend-difference"
    >
      <Link
        href="/"
        className="flex items-center hover:opacity-80 transition-opacity shrink-0 ml-2 sm:ml-4 mt-2 sm:mt-3"
        aria-label="Zaid AI Agency — Home"
        onClick={(e) => {
          if (window.location.pathname === "/") {
            e.preventDefault();
            scrollToSection("home");
          }
        }}
      >
        <Image
          src="/zaid-logo.png"
          alt="Zaid AI Agency Logo"
          width={180}
          height={60}
          className="h-[38px] sm:h-12 w-auto object-contain"
          priority
        />
      </Link>

      <nav className="flex items-center gap-1 sm:gap-2 mr-2 sm:mr-4 mt-2 sm:mt-3 font-inter">
        <button
          onClick={() => scrollToSection("about")}
          className="group text-white/80 hover:text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 transition-colors"
        >
          <HoverSlideText text="Learn More" />
        </button>

        <div className="relative h-9 w-[108px] sm:w-[122px] flex items-center justify-end">
          {!isCTAInView && (
            <motion.button
              layoutId="lets-connect-cta"
              onClick={() => router.push("/contact")}
              transition={{
                layout: { duration: 1.1, ease: [0.32, 0.72, 0, 1] },
              }}
              className="group absolute inset-y-0 right-0 bg-white text-black hover:bg-white text-xs sm:text-sm font-medium px-3 sm:px-4 rounded-full transition-colors flex items-center whitespace-nowrap leading-none"
            >
              <HoverSlideText text={"Let’s Connect"} />
            </motion.button>
          )}
        </div>
      </nav>
    </header>
  );
}
