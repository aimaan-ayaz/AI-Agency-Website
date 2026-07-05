"use client";

import { AnimatePresence, motion } from "framer-motion";
import { formatPrice } from "@/lib/cart";
import type { PayMethod } from "@/components/PaymentSheet";

interface Props {
  success: boolean;
  total: number;
  method: PayMethod;
}

export default function PaymentOverlay({ success, total, method }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 mx-auto flex max-w-md flex-col items-center justify-center bg-cream px-8"
    >
      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div
            key="processing"
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
              className="h-14 w-14 rounded-full border-4 border-line border-t-ink"
            />
            <p className="mt-6 font-display text-lg tracking-[0.15em] uppercase">
              Processing payment
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {formatPrice(total)} · {method}
            </p>
          </motion.div>
        ) : (
          <motion.div key="success" className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="flex h-24 w-24 items-center justify-center rounded-full bg-accent"
            >
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden>
                <motion.path
                  d="M13 27.5 22 36.5 39 18"
                  stroke="#fff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.25, duration: 0.45, ease: "easeOut" }}
                />
              </svg>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 font-display text-xl tracking-[0.15em] uppercase text-accent"
            >
              Payment received
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-1 text-sm text-ink-soft"
            >
              {formatPrice(total)} paid via {method}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
