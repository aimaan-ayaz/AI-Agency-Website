"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { menu } from "@/data/menu";
import BottomSheet from "@/components/BottomSheet";

interface Props {
  activeCat: string;
  /** True when the cart bar is visible, so the button floats above it. */
  raised: boolean;
  onJump: (catId: string) => void;
}

/** Floating "Menu" button → bottom sheet listing every category for one-tap jumps. */
export default function CategoryNav({ activeCat, raised, onJump }: Props) {
  const [open, setOpen] = useState(false);

  const jump = (catId: string) => {
    setOpen(false);
    onJump(catId);
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.92 }}
        animate={{ y: 0 }}
        className={`fixed right-4 z-30 flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-cream shadow-xl shadow-ink/30 transition-[bottom] duration-300 ${
          raised ? "bottom-24" : "bottom-6"
        }`}
        aria-label="Browse menu sections"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
          <path d="M4 6h16M4 12h16M4 18h10" />
        </svg>
        <span className="font-display text-sm font-medium tracking-[0.15em] uppercase">Menu</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <BottomSheet key="catnav" onClose={() => setOpen(false)}>
            <div className="px-5 pb-8">
              <h2 className="font-display text-2xl font-medium tracking-wide uppercase">
                Browse the menu
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {menu.map((cat) => {
                  const active = cat.id === activeCat;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => jump(cat.id)}
                      className={`rounded-xl px-3.5 py-3 text-left transition-colors ${
                        active
                          ? "bg-ink text-cream"
                          : "border border-line bg-white/50 active:bg-cream"
                      }`}
                    >
                      <span className="block font-display text-[13px] leading-tight font-medium tracking-wide uppercase">
                        {cat.name}
                      </span>
                      <span className={`mt-0.5 block text-[11px] ${active ? "text-cream/70" : "text-ink-soft"}`}>
                        {cat.items.length} items
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>
    </>
  );
}
