"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Navbar() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0, x: "-50%" }}
      animate={{ y: 0, opacity: 1, x: "-50%" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] md:w-fit rounded-full flex items-center justify-between md:justify-center px-4 sm:px-6 py-2.5 bg-black/60 backdrop-blur-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-x-auto hide-scrollbar"
    >
      <nav className="flex items-center justify-between w-full md:w-auto gap-3 sm:gap-6 md:gap-12 text-[11px] sm:text-sm font-medium text-white/70 whitespace-nowrap">
        <button onClick={() => scrollToSection("home")} className="flex items-center hover:opacity-80 transition-opacity shrink-0">
          <Image
            src="/Zaid.png"
            alt="ZAID AI Agency Logo"
            width={160}
            height={60}
            className="h-6 sm:h-8 w-auto object-contain"
            priority
          />
        </button>
        <button onClick={() => scrollToSection("home")} className="hover:text-white transition-colors shrink-0">
          Home
        </button>
        <button onClick={() => scrollToSection("services")} className="hover:text-white transition-colors shrink-0">
          Services
        </button>
        <button onClick={() => scrollToSection("contact")} className="hover:text-white transition-colors shrink-0">
          Contact Us
        </button>
      </nav>
    </motion.header>
  );
}
