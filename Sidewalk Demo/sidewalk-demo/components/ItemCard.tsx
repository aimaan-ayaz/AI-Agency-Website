"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { MenuItem, Tag } from "@/data/menu";
import type { Variant } from "@/lib/cart";
import { formatPrice } from "@/lib/cart";
import FoodIcon from "@/components/FoodIcon";

/** Muted, paper-friendly tile tones — no external images needed. */
const TILE_COLORS = [
  "#e8dcc3",
  "#e3d2be",
  "#dde3d0",
  "#e9dbd2",
  "#f0e6cd",
  "#dbe2dc",
  "#e6d8c9",
  "#e0e0cf",
];

function tileColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return TILE_COLORS[Math.abs(hash) % TILE_COLORS.length];
}

/** Pastel filled dot, left of the item name — exactly like the printed menu. */
function DietDot({ tags }: { tags?: Tag[] }) {
  const diet = tags?.find((t) => t === "veg" || t === "nonveg" || t === "egg");
  if (!diet) return null;
  const label = { veg: "Veg", nonveg: "Non-veg", egg: "Contains egg" }[diet];
  return (
    <span
      title={label}
      className="mt-[7px] h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ background: `var(--color-${diet})` }}
    />
  );
}

/** The ☺ Sidewalk Specials mark, shown after the name like on the menu. */
function Smiley() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="ml-1.5 -mt-0.5 inline-block"
      aria-label="Sidewalk special"
    >
      <title>Sidewalk Special</title>
      <circle cx="12" cy="12" r="10" />
      <path d="M8.3 13.4c1 1.3 2.3 1.9 3.7 1.9s2.7-.6 3.7-1.9" strokeLinecap="round" />
      <path d="M9 8.8v1.4M15 8.8v1.4" strokeLinecap="round" />
    </svg>
  );
}

interface Props {
  item: MenuItem;
  categoryId: string;
  qty: number;
  onAdd: (item: MenuItem, variant?: Variant) => void;
  onInc: () => void;
  onDec: () => void;
}

export default function ItemCard({ item, categoryId, qty, onAdd, onInc, onDec }: Props) {
  const [choosing, setChoosing] = useState(false);
  const hasVariants = item.icedPrice !== undefined;

  const add = (variant?: Variant) => {
    setChoosing(false);
    onAdd(item, variant);
  };

  return (
    <div className="flex gap-3 py-4">
      {/* Illustrated tile — swap for real photos later */}
      <div
        className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl text-ink/60"
        style={{ background: tileColor(item.id) }}
      >
        <FoodIcon item={item} categoryId={categoryId} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="flex items-start gap-1.5 leading-snug font-semibold">
          <DietDot tags={item.tags} />
          <span>
            {item.name}
            {item.tags?.includes("special") && <Smiley />}
            {item.tags?.includes("spicy") && (
              <span className="ml-1 align-middle text-[11px] font-bold tracking-tighter text-spice" title="Spicy">
                !!!
              </span>
            )}
          </span>
        </h3>
        {item.description && (
          <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{item.description}</p>
        )}
        <p className="mt-1 text-sm font-semibold">
          {formatPrice(item.price)}
          {hasVariants && (
            <span className="font-normal text-ink-soft">
              {" "}
              / {formatPrice(item.icedPrice!)}{" "}
              <span className="text-[10px] tracking-wide uppercase">hot / iced</span>
            </span>
          )}
        </p>
      </div>

      {/* Add control */}
      <div className="relative flex flex-col items-end justify-center">
        {qty === 0 ? (
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => (hasVariants ? setChoosing((c) => !c) : add())}
            className="rounded-xl border border-ink bg-paper px-4 py-2 font-display text-sm font-medium tracking-widest uppercase shadow-[2px_2px_0_var(--color-ink)] active:shadow-none"
          >
            Add
          </motion.button>
        ) : (
          <div className="flex items-center gap-1 rounded-xl bg-ink text-cream">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={onDec}
              className="px-3 py-2 text-lg leading-none"
              aria-label={`Remove one ${item.name}`}
            >
              −
            </motion.button>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={qty}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-4 text-center font-display text-sm font-medium"
              >
                {qty}
              </motion.span>
            </AnimatePresence>
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={() => (hasVariants ? setChoosing((c) => !c) : onInc())}
              className="px-3 py-2 text-lg leading-none"
              aria-label={`Add one ${item.name}`}
            >
              +
            </motion.button>
          </div>
        )}

        {/* Hot / Iced chooser */}
        <AnimatePresence>
          {choosing && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 z-10 mt-2 flex w-32 flex-col overflow-hidden rounded-xl border border-ink bg-paper shadow-[3px_3px_0_var(--color-ink)]"
            >
              <button
                onClick={() => add("Hot")}
                className="flex items-center justify-between px-3 py-2.5 text-sm font-medium active:bg-cream"
              >
                Hot <span className="text-xs">{formatPrice(item.price)}</span>
              </button>
              <button
                onClick={() => add("Iced")}
                className="flex items-center justify-between border-t border-line px-3 py-2.5 text-sm font-medium active:bg-cream"
              >
                Iced <span className="text-xs">{formatPrice(item.icedPrice!)}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
