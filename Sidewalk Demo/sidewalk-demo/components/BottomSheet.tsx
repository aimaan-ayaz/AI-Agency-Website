"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  onClose?: () => void;
  children: ReactNode;
}

/** Shared slide-up sheet with dimmed backdrop. */
export default function BottomSheet({ onClose, children }: Props) {
  return (
    <div className="fixed inset-0 z-40 mx-auto flex max-w-md flex-col justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-ink/40"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
        className="relative max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-paper shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex justify-center bg-paper pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-line" />
        </div>
        {children}
      </motion.div>
    </div>
  );
}
