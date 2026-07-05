"use client";

import { motion } from "framer-motion";
import { brand } from "@/data/brand";
import type { CartLine } from "@/lib/cart";
import { formatPrice } from "@/lib/cart";
import BottomSheet from "@/components/BottomSheet";

interface Props {
  lines: CartLine[];
  total: number;
  onInc: (key: string) => void;
  onDec: (key: string) => void;
  onClose: () => void;
  onPay: () => void;
}

export default function CartSheet({ lines, total, onInc, onDec, onClose, onPay }: Props) {
  return (
    <BottomSheet onClose={onClose}>
      <div className="px-5 pb-6">
        <h2 className="font-display text-2xl font-medium tracking-wide uppercase">Your order</h2>

        {lines.length === 0 ? (
          <div className="py-10 text-center text-sm text-ink-soft">
            Your cart is empty — go grab something tasty.
            <button
              onClick={onClose}
              className="mx-auto mt-4 block rounded-xl border border-ink px-5 py-2.5 font-display text-sm tracking-widest uppercase"
            >
              Back to menu
            </button>
          </div>
        ) : (
          <>
            <ul className="mt-2">
              {lines.map((line) => (
                <li
                  key={line.key}
                  className="flex items-center gap-3 border-b border-line py-3.5 last:border-b-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug font-semibold">
                      {line.item.name}
                      {line.variant && (
                        <span className="ml-1.5 rounded-full border border-line px-1.5 text-[10px] font-medium tracking-wide uppercase text-ink-soft">
                          {line.variant}
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-soft">{formatPrice(line.unitPrice)} each</p>
                  </div>

                  <div className="flex items-center gap-1 rounded-lg border border-ink">
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => onDec(line.key)}
                      className="px-2.5 py-1.5 text-base leading-none"
                      aria-label={`Remove one ${line.item.name}`}
                    >
                      −
                    </motion.button>
                    <span className="w-4 text-center font-display text-sm">{line.qty}</span>
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => onInc(line.key)}
                      className="px-2.5 py-1.5 text-base leading-none"
                      aria-label={`Add one ${line.item.name}`}
                    >
                      +
                    </motion.button>
                  </div>

                  <span className="w-16 text-right text-sm font-semibold">
                    {formatPrice(line.qty * line.unitPrice)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between border-t-2 border-ink pt-3">
              <span className="font-display text-base tracking-widest uppercase">Subtotal</span>
              <span className="text-lg font-bold">{formatPrice(total)}</span>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-ink-soft">{brand.finePrint}</p>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onPay}
              className="mt-4 w-full rounded-2xl bg-accent py-4 font-display text-base font-medium tracking-[0.15em] text-white uppercase shadow-lg shadow-accent/30"
            >
              Proceed to pay · {formatPrice(total)}
            </motion.button>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
