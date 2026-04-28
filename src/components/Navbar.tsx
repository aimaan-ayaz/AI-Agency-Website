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
      className="fixed top-4 left-1/2 z-50 w-fit rounded-full flex items-center justify-center px-6 py-2.5 bg-black/60 backdrop-blur-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
    >
      <nav className="flex items-center gap-8 md:gap-12 text-sm font-medium text-white/70">
        <button onClick={() => scrollToSection("home")} className="flex items-center hover:opacity-80 transition-opacity">
          <Image
            src="/Zaid.png"
            alt="ZAID AI Agency Logo"
            width={160}
            height={60}
            className="h-8 w-auto object-contain"
            priority
          />
        </button>
        <button onClick={() => scrollToSection("home")} className="hover:text-white transition-colors">
          Home
        </button>
        <button onClick={() => scrollToSection("services")} className="hover:text-white transition-colors">
          Services
        </button>
        <button onClick={() => scrollToSection("contact")} className="hover:text-white transition-colors">
          Contact Us
        </button>
      </nav>
    </motion.header>
  );
}
