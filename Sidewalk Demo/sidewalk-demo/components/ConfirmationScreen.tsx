"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { brand } from "@/data/brand";
import type { CartLine } from "@/lib/cart";
import { formatPrice } from "@/lib/cart";
import logo from "@/public/logo.png";

interface Props {
  order: { number: string; lines: CartLine[]; total: number };
  table: string;
  onDone: () => void;
}

export default function ConfirmationScreen({ order, table, onDone }: Props) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex min-h-dvh flex-col px-5 pt-8 pb-8"
    >
      <div className="flex justify-center">
        <Image src={logo} alt={brand.logoAlt} className="h-6 w-auto" />
      </div>

      <div className="mt-8 flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
          <svg width="30" height="30" viewBox="0 0 52 52" fill="none" aria-hidden>
            <path
              d="M13 27.5 22 36.5 39 18"
              stroke="#fff"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h1 className="mt-4 font-display text-2xl font-medium tracking-[0.1em] uppercase">
          Payment received
        </h1>
        <p className="mt-1 rounded-full border border-ink px-4 py-1 font-display text-sm tracking-[0.15em] uppercase">
          Order #{order.number}
        </p>
      </div>

      {/* Order summary */}
      <div className="mt-8 rounded-2xl border border-line bg-paper p-5">
        <div className="flex items-center justify-between border-b-2 border-ink pb-2">
          <span className="font-display text-sm tracking-[0.15em] uppercase">Order summary</span>
          <span className="font-display text-sm tracking-[0.15em] uppercase">Table {table}</span>
        </div>
        <ul className="mt-1">
          {order.lines.map((line) => (
            <li
              key={line.key}
              className="flex items-baseline justify-between gap-3 border-b border-line py-2.5 text-sm last:border-b-0"
            >
              <span className="min-w-0">
                <span className="font-semibold">{line.qty} ×</span> {line.item.name}
                {line.variant && <span className="text-ink-soft"> ({line.variant})</span>}
              </span>
              <span className="shrink-0 font-medium">{formatPrice(line.qty * line.unitPrice)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-center justify-between border-t-2 border-ink pt-2.5">
          <span className="font-display text-sm tracking-[0.15em] uppercase">Total paid</span>
          <span className="text-base font-bold">{formatPrice(order.total)}</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 rounded-2xl bg-ink px-5 py-4 text-center text-cream"
      >
        <p className="font-display text-base tracking-[0.1em] uppercase">
          Your order is being prepared ☕
        </p>
        <p className="mt-1 text-sm opacity-80">Estimated time: {brand.estimatedTime}</p>
      </motion.div>

      <p className="mt-4 text-center text-xs text-ink-soft">
        Sit back, relax and have your coffee — we&apos;ll bring it to Table {table}.
      </p>

      <div className="flex-1" />

      <button
        onClick={onDone}
        className="mt-8 w-full rounded-2xl border border-ink py-4 font-display text-sm font-medium tracking-[0.15em] uppercase active:bg-paper"
      >
        Order something else
      </button>
    </motion.main>
  );
}
