"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { MenuItem } from "@/data/menu";
import { menu } from "@/data/menu";
import { brand } from "@/data/brand";
import type { CartLine, Variant } from "@/lib/cart";
import ItemCard from "@/components/ItemCard";
import CategoryNav from "@/components/CategoryNav";
import logo from "@/public/logo.png";

interface Props {
  table: string;
  lines: CartLine[];
  onAdd: (item: MenuItem, variant?: Variant) => void;
  onInc: (item: MenuItem) => void;
  onDec: (item: MenuItem) => void;
}

export default function MenuScreen({ table, lines, onAdd, onInc, onDec }: Props) {
  const [activeCat, setActiveCat] = useState(menu[0].id);
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const suppressSpy = useRef(false);

  // Scroll-spy: highlight the category currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (suppressSpy.current) return;
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveCat(visible[0].target.id.replace("cat-", ""));
        }
      },
      { rootMargin: "-140px 0px -60% 0px" }
    );
    for (const cat of menu) {
      const el = document.getElementById(`cat-${cat.id}`);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  // Keep the active chip visible in the rail
  useEffect(() => {
    chipRefs.current[activeCat]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeCat]);

  const jumpTo = (catId: string) => {
    setActiveCat(catId);
    // Don't let the spy fight the smooth scroll
    suppressSpy.current = true;
    document.getElementById(`cat-${catId}`)?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => (suppressSpy.current = false), 900);
  };

  const qtyOf = (item: MenuItem) =>
    lines.filter((l) => l.item.id === item.id).reduce((n, l) => n + l.qty, 0);

  const cartHasItems = lines.length > 0;

  return (
    <main className="pb-36">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-line bg-cream/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <Image src={logo} alt={brand.logoAlt} priority className="h-6 w-auto" />
          <span className="rounded-full border border-ink px-3 py-1 font-display text-xs font-medium tracking-[0.15em] uppercase">
            Table {table}
          </span>
        </div>

        {/* Category rail */}
        <nav className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-3">
          {menu.map((cat) => (
            <button
              key={cat.id}
              ref={(el) => {
                chipRefs.current[cat.id] = el;
              }}
              onClick={() => jumpTo(cat.id)}
              className={`shrink-0 rounded-full px-4 py-2 font-display text-sm tracking-wide uppercase transition-colors ${
                activeCat === cat.id
                  ? "bg-ink text-cream"
                  : "bg-paper text-ink-soft border border-line"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </nav>
      </header>

      {/* Welcome strip */}
      <div className="px-5 pt-6 pb-1">
        <h1 className="font-display text-3xl font-medium tracking-wide uppercase">
          {brand.welcome}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          {brand.tagline} — order from your table, we&apos;ll bring it over.
        </p>
      </div>

      {/* Sections */}
      {menu.map((cat) => (
        <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-32 px-5 pt-8">
          <div className="border-b-2 border-ink pb-2">
            <h2 className="font-display text-xl font-medium tracking-[0.08em] uppercase">
              {cat.name}
            </h2>
            {cat.note && <p className="mt-0.5 text-xs text-ink-soft italic">{cat.note}</p>}
          </div>
          <ul>
            {cat.items.map((item) => (
              <li key={item.id} className="border-b border-line last:border-b-0">
                <ItemCard
                  item={item}
                  categoryId={cat.id}
                  qty={qtyOf(item)}
                  onAdd={onAdd}
                  onInc={() => onInc(item)}
                  onDec={() => onDec(item)}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <CategoryNav activeCat={activeCat} raised={cartHasItems} onJump={jumpTo} />

      <footer className="px-5 pt-10 pb-6 text-center text-[11px] leading-relaxed text-ink-soft">
        {brand.finePrint}
        <div className="mt-2 font-display tracking-[0.2em] uppercase">
          With love, Team {brand.name}
        </div>
      </footer>
    </main>
  );
}
