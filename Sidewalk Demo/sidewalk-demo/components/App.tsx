"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import type { MenuItem } from "@/data/menu";
import { brand } from "@/data/brand";
import { type CartLine, type Variant, lineKey, cartCount, cartTotal } from "@/lib/cart";
import MenuScreen from "@/components/MenuScreen";
import CartBar from "@/components/CartBar";
import CartSheet from "@/components/CartSheet";
import PaymentSheet, { type PayMethod } from "@/components/PaymentSheet";
import PaymentOverlay from "@/components/PaymentOverlay";
import ConfirmationScreen from "@/components/ConfirmationScreen";

type Stage = "menu" | "cart" | "payment" | "processing" | "success" | "confirmed";

export default function App() {
  const searchParams = useSearchParams();
  const table = searchParams.get("table") || brand.defaultTable;

  const [stage, setStage] = useState<Stage>("menu");
  const [lines, setLines] = useState<CartLine[]>([]);
  const [method, setMethod] = useState<PayMethod>("Google Pay");
  const [order, setOrder] = useState<{ number: string; lines: CartLine[]; total: number } | null>(null);

  const count = useMemo(() => cartCount(lines), [lines]);
  const total = useMemo(() => cartTotal(lines), [lines]);

  const addItem = useCallback((item: MenuItem, variant?: Variant) => {
    setLines((prev) => {
      const key = lineKey(item, variant);
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l));
      }
      const unitPrice = variant === "Iced" && item.icedPrice ? item.icedPrice : item.price;
      return [...prev, { key, item, variant, unitPrice, qty: 1 }];
    });
  }, []);

  const incLine = useCallback((key: string) => {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l)));
  }, []);

  const decLine = useCallback((key: string) => {
    setLines((prev) =>
      prev
        .map((l) => (l.key === key ? { ...l, qty: l.qty - 1 } : l))
        .filter((l) => l.qty > 0)
    );
  }, []);

  /** Card-level +/- : operate on the most recently added line of that item. */
  const incItem = useCallback(
    (item: MenuItem) => {
      const line = [...lines].reverse().find((l) => l.item.id === item.id);
      if (line) incLine(line.key);
    },
    [lines, incLine]
  );
  const decItem = useCallback(
    (item: MenuItem) => {
      const line = [...lines].reverse().find((l) => l.item.id === item.id);
      if (line) decLine(line.key);
    },
    [lines, decLine]
  );

  // Simulated payment: processing → success tick → confirmation
  useEffect(() => {
    if (stage === "processing") {
      const t = setTimeout(() => setStage("success"), 2200);
      return () => clearTimeout(t);
    }
    if (stage === "success") {
      const t = setTimeout(() => {
        setOrder({
          number: `SW-${1000 + Math.floor(Math.random() * 9000)}`,
          lines,
          total,
        });
        setLines([]);
        setStage("confirmed");
      }, 1700);
      return () => clearTimeout(t);
    }
  }, [stage, lines, total]);

  const reset = useCallback(() => {
    setOrder(null);
    setStage("menu");
  }, []);

  if (stage === "confirmed" && order) {
    return <ConfirmationScreen order={order} table={table} onDone={reset} />;
  }

  return (
    <>
      <MenuScreen table={table} lines={lines} onAdd={addItem} onInc={incItem} onDec={decItem} />

      <AnimatePresence>
        {count > 0 && stage === "menu" && (
          <CartBar key="cartbar" count={count} total={total} onView={() => setStage("cart")} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === "cart" && (
          <CartSheet
            key="cart"
            lines={lines}
            total={total}
            onInc={incLine}
            onDec={decLine}
            onClose={() => setStage("menu")}
            onPay={() => setStage("payment")}
          />
        )}
        {stage === "payment" && (
          <PaymentSheet
            key="payment"
            total={total}
            table={table}
            method={method}
            onSelect={setMethod}
            onBack={() => setStage("cart")}
            onPay={() => setStage("processing")}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(stage === "processing" || stage === "success") && (
          <PaymentOverlay key="overlay" success={stage === "success"} total={total} method={method} />
        )}
      </AnimatePresence>
    </>
  );
}
