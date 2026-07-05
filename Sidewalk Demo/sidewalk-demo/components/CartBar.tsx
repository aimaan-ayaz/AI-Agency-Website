"use client";

import { AnimatePresence, motion } from "framer-motion";
import { formatPrice } from "@/lib/cart";

interface Props {
  count: number;
  total: number;
  onView: () => void;
}

export default function CartBar({ count, total, onView }: Props) {
  return (
    <motion.div
      initial={{ y: 90 }}
      animate={{ y: 0 }}
      exit={{ y: 90 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md px-4 pb-4"
    >
      <motion.button
        onClick={onView}
        whileTap={{ scale: 0.97 }}
        className="flex w-full items-center justify-between rounded-2xl bg-ink px-5 py-4 text-cream shadow-xl shadow-ink/25"
      >
        <span className="flex items-baseline gap-2 text-sm">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={`${count}-${total}`}
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="font-semibold"
            >
              {count} {count === 1 ? "item" : "items"} · {formatPrice(total)}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="font-display text-sm font-medium tracking-[0.15em] uppercase">
          View cart →
        </span>
      </motion.button>
    </motion.div>
  );
}
