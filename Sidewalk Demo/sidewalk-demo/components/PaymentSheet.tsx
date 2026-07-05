"use client";

import { motion } from "framer-motion";
import { brand } from "@/data/brand";
import { formatPrice } from "@/lib/cart";
import BottomSheet from "@/components/BottomSheet";

export type PayMethod = "Google Pay" | "PhonePe" | "Paytm" | "Card";

const UPI_OPTIONS: { method: PayMethod; badge: string; color: string }[] = [
  { method: "Google Pay", badge: "G", color: "#4285F4" },
  { method: "PhonePe", badge: "Pe", color: "#5F259F" },
  { method: "Paytm", badge: "P", color: "#00BAF2" },
];

interface Props {
  total: number;
  table: string;
  method: PayMethod;
  onSelect: (m: PayMethod) => void;
  onBack: () => void;
  onPay: () => void;
}

function Radio({ selected }: { selected: boolean }) {
  return (
    <span
      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
        selected ? "border-accent" : "border-line"
      }`}
    >
      {selected && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
    </span>
  );
}

export default function PaymentSheet({ total, table, method, onSelect, onBack, onPay }: Props) {
  return (
    <BottomSheet onClose={onBack}>
      {/* Razorpay-style checkout header */}
      <div className="mx-5 flex items-center justify-between rounded-2xl bg-ink px-4 py-3.5 text-cream">
        <div>
          <p className="font-display text-base font-medium tracking-widest uppercase">
            {brand.name}
          </p>
          <p className="text-xs opacity-70">Dine-in · Table {table}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">{formatPrice(total)}</p>
          <p className="text-[10px] tracking-wide uppercase opacity-70">Amount payable</p>
        </div>
      </div>

      <div className="px-5 pt-5 pb-6">
        <p className="mb-2 text-[11px] font-semibold tracking-[0.15em] uppercase text-ink-soft">
          UPI
        </p>
        <div className="overflow-hidden rounded-2xl border border-line bg-white/50">
          {UPI_OPTIONS.map((opt) => (
            <button
              key={opt.method}
              onClick={() => onSelect(opt.method)}
              className="flex w-full items-center gap-3 border-b border-line px-4 py-3.5 last:border-b-0 active:bg-cream"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: opt.color }}
              >
                {opt.badge}
              </span>
              <span className="flex-1 text-left text-sm font-medium">{opt.method}</span>
              <Radio selected={method === opt.method} />
            </button>
          ))}
        </div>

        <p className="mt-5 mb-2 text-[11px] font-semibold tracking-[0.15em] uppercase text-ink-soft">
          Cards
        </p>
        <div className="overflow-hidden rounded-2xl border border-line bg-white/50">
          <button
            onClick={() => onSelect("Card")}
            className="flex w-full items-center gap-3 px-4 py-3.5 active:bg-cream"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-cream">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="2" y="5" width="20" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
                <path d="M2 9.5h20" stroke="currentColor" strokeWidth="1.6" />
                <path d="M6 14.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <span className="flex-1 text-left text-sm font-medium">Credit / Debit Card</span>
            <Radio selected={method === "Card"} />
          </button>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onPay}
          className="mt-6 w-full rounded-2xl bg-accent py-4 font-display text-base font-medium tracking-[0.15em] text-white uppercase shadow-lg shadow-accent/30"
        >
          Pay {formatPrice(total)}
        </motion.button>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-ink-soft">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 1 1 6 0v3H9Z" />
          </svg>
          Secured checkout · Demo mode — no real payment is processed
        </p>
      </div>
    </BottomSheet>
  );
}
