import type { ReactNode } from "react";
import type { MenuItem } from "@/data/menu";

/**
 * Hand-drawn-style line icons for every menu item, matching the menu's
 * black-ink illustration style. Items are matched by keyword (RULES below),
 * falling back to a per-category default — so new items get an icon
 * automatically. To use real photos later, replace <FoodIcon /> in
 * ItemCard.tsx with an <Image />.
 */

type IconKey =
  | "espresso" | "coffeeCup" | "icedGlass" | "frappe" | "sundae" | "matcha"
  | "dripper" | "frenchPress" | "hotChoc" | "teacup" | "bottle" | "juice"
  | "soda" | "can" | "friedEgg" | "smoothieBowl" | "pancakes" | "waffle"
  | "churros" | "bagel" | "skillet" | "wrap" | "toast" | "fries" | "nachos"
  | "garlicBread" | "rings" | "platter" | "taco" | "drumstick" | "fish"
  | "prawn" | "skewer" | "salad" | "soup" | "sandwich" | "burger" | "pizza"
  | "pasta" | "riceBowl" | "plateCutlery";

const ICONS: Record<IconKey, ReactNode> = {
  espresso: (
    <>
      <path d="M6 8h9v4.5a4.5 4.5 0 0 1-9 0Z" />
      <path d="M15 9h1.5a2.2 2.2 0 0 1 0 4.4H15" />
      <path d="M5 20h11" />
      <path d="M9 3.5V5M12 3.5V5" />
    </>
  ),
  coffeeCup: (
    <>
      <path d="M6 7h12v9a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4Z" />
      <path d="M18 9h.8a2.4 2.4 0 0 1 0 4.8H18" />
      <path d="M10 2.5v2M14 2.5v2" />
    </>
  ),
  icedGlass: (
    <>
      <path d="M7 4h10l-1.2 15.2a2 2 0 0 1-2 1.8h-3.6a2 2 0 0 1-2-1.8Z" />
      <path d="M14.5 2l-2 5" />
      <path d="M9.5 11.5h3v3h-3zM13 15h2.6v2.6H13z" />
    </>
  ),
  frappe: (
    <>
      <path d="M8 9h8l-1 11.5a1.6 1.6 0 0 1-1.6 1.5h-2.8a1.6 1.6 0 0 1-1.6-1.5Z" />
      <path d="M7.5 9c0-2 2-3.5 4.5-3.5S16.5 7 16.5 9" />
      <path d="M14.5 1.5 13.5 4" />
      <circle cx="11" cy="3.6" r="1" />
    </>
  ),
  sundae: (
    <>
      <path d="M7 12h10l-1.4 7.4a2 2 0 0 1-2 1.6h-3.2a2 2 0 0 1-2-1.6Z" />
      <path d="M8 12a4.2 4.2 0 0 1 8 0" />
      <circle cx="12" cy="5.6" r="1.2" />
      <path d="M12 4.4V3" />
    </>
  ),
  matcha: (
    <>
      <path d="M4.5 12.5h15a7.5 7.5 0 0 1-15 0Z" />
      <path d="M16.5 3.5v4M15 3.8c-.2 2 .3 3.3 1.5 3.7M18 3.8c.2 2-.3 3.3-1.5 3.7" />
      <path d="M8 9.5c.8-.8 2-.8 2.8 0" />
    </>
  ),
  dripper: (
    <>
      <path d="M6 4h12l-3.6 6h-4.8Z" />
      <path d="M12 11.5v1.8" />
      <path d="M8 16h8v1.6a3.4 3.4 0 0 1-3.4 3.4h-1.2A3.4 3.4 0 0 1 8 17.6Z" />
    </>
  ),
  frenchPress: (
    <>
      <path d="M7 8h10v10.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 18.5Z" />
      <path d="M12 3.8V8" />
      <circle cx="12" cy="2.9" r="1" />
      <path d="M7 13h10" />
      <path d="M17 10.5h1.6v5H17" />
    </>
  ),
  hotChoc: (
    <>
      <path d="M6 7h12v9a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4Z" />
      <path d="M18 9h.8a2.4 2.4 0 0 1 0 4.8H18" />
      <path d="M8.8 9.5h2.6v2.6H8.8zM12.4 10.2H15v2.6h-2.6z" />
      <path d="M12 2.5v2" />
    </>
  ),
  teacup: (
    <>
      <path d="M5.5 10h13l-1 5a4.5 4.5 0 0 1-4.4 3.6h-2.2A4.5 4.5 0 0 1 6.5 15Z" />
      <path d="M18.5 11h1a2 2 0 0 1 0 4h-1.3" />
      <path d="M5 21.5h14" />
      <path d="m14.5 10 2.7-4.6" />
      <path d="M16.6 3.4h2.8v2.2h-2.8z" />
    </>
  ),
  bottle: (
    <>
      <path d="M10.4 2.8h3.2v3.8c2 .9 3.2 2.4 3.2 4.6v7.6a2.2 2.2 0 0 1-2.2 2.2h-5.2a2.2 2.2 0 0 1-2.2-2.2v-7.6c0-2.2 1.2-3.7 3.2-4.6Z" />
      <path d="M10.4 4.8h3.2" />
      <circle cx="11" cy="13.5" r=".9" />
      <circle cx="13.4" cy="16.4" r=".9" />
    </>
  ),
  juice: (
    <>
      <path d="M8 6.5h8l-.9 13.2a1.8 1.8 0 0 1-1.8 1.7h-2.6a1.8 1.8 0 0 1-1.8-1.7Z" />
      <path d="M8.6 11.5h6.8" />
      <circle cx="18.2" cy="5" r="2.6" />
      <path d="M18.2 2.4v5.2M15.6 5h5.2" />
    </>
  ),
  soda: (
    <>
      <path d="M7.5 4.5h9l-.9 14.7a1.9 1.9 0 0 1-1.9 1.8h-3.4a1.9 1.9 0 0 1-1.9-1.8Z" />
      <path d="M15.5 2 13 6.5" />
      <circle cx="10.8" cy="11" r=".8" />
      <circle cx="13" cy="14.5" r=".8" />
      <circle cx="11.5" cy="17" r=".7" />
    </>
  ),
  can: (
    <>
      <path d="M8 5.6c0-1 1.8-1.8 4-1.8s4 .8 4 1.8" />
      <path d="M8 5.6v12.6a1.8 1.8 0 0 0 1.8 1.8h4.4a1.8 1.8 0 0 0 1.8-1.8V5.6" />
      <path d="m10.5 5.4 3-.4" />
    </>
  ),
  friedEgg: (
    <>
      <path d="M12 4c3.8 0 6.9 2.2 7.6 5.4.6 2.8-.6 4.6-.4 6.6.1 1.6-1.2 3.4-3.4 3.8-2 .4-3-.6-5-.4-2 .2-3.2.8-4.9-.2-1.7-1-2.3-3-1.7-5C4.9 12 4 10.6 4.6 8.4 5.4 5.7 8.4 4 12 4Z" />
      <circle cx="11.6" cy="11.6" r="2.6" />
    </>
  ),
  smoothieBowl: (
    <>
      <path d="M4.5 12.5h15a7.5 7.5 0 0 1-15 0Z" />
      <circle cx="8.6" cy="10.4" r="1.2" />
      <circle cx="12" cy="9.6" r="1.2" />
      <circle cx="15.4" cy="10.4" r="1.2" />
    </>
  ),
  pancakes: (
    <>
      <path d="M5 9.5c0 1.5 3.1 2.7 7 2.7s7-1.2 7-2.7-3.1-2.7-7-2.7-7 1.2-7 2.7Z" />
      <path d="M5 9.5v4.2c0 1.5 3.1 2.7 7 2.7s7-1.2 7-2.7V9.5" />
      <path d="M10.6 5.4h2.8v1.7h-2.8z" />
      <path d="M4 20h16" />
    </>
  ),
  waffle: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="3" />
      <path d="M9.7 5v14M14.3 5v14M5 9.7h14M5 14.3h14" />
    </>
  ),
  churros: (
    <>
      <path d="M4.5 16.5 15 6c.8-.8 2-.8 2.8 0s.8 2 0 2.8L7.3 19.3c-.8.8-2 .8-2.8 0s-.8-2 0-2.8Z" />
      <path d="m9.2 9.8 2.4 2.4M12.2 6.8l2.4 2.4" />
      <path d="M15.5 16.5H21l-.6 3.4a1.4 1.4 0 0 1-1.4 1.1h-1.5a1.4 1.4 0 0 1-1.4-1.1Z" />
    </>
  ),
  bagel: (
    <>
      <circle cx="12" cy="12.5" r="7.5" />
      <circle cx="12" cy="12.5" r="2.6" />
      <path d="m8.8 6.2.4.8M12 5.2v.9M15.2 6.2l-.4.8" />
    </>
  ),
  skillet: (
    <>
      <circle cx="10.5" cy="13" r="6.5" />
      <path d="M17 13h4.8" />
      <circle cx="10.5" cy="13" r="2.2" />
    </>
  ),
  wrap: (
    <>
      <path d="M5.5 14 13 6.5a5 5 0 0 1 7 7L12.5 21a5 5 0 0 1-7-7Z" />
      <path d="M8.6 11.4c1.2.4 2.6 1.8 3 3" />
    </>
  ),
  toast: (
    <>
      <path d="M5 9.2c0-2.9 2.6-4.7 7-4.7s7 1.8 7 4.7V19a1.6 1.6 0 0 1-1.6 1.6H6.6A1.6 1.6 0 0 1 5 19Z" />
      <path d="M10.4 10h3.2v2.4h-3.2z" />
    </>
  ),
  fries: (
    <>
      <path d="M7 11.5l1.4 8.2a1.5 1.5 0 0 0 1.5 1.3h4.2a1.5 1.5 0 0 0 1.5-1.3L17 11.5Z" />
      <path d="M6.5 11.5h11" />
      <path d="M10 11V5.5M12 11V4.5M14 11V5.5" />
    </>
  ),
  nachos: (
    <>
      <path d="M12 4l8.5 15.5h-17Z" />
      <circle cx="10.5" cy="14.5" r="1" />
      <circle cx="14" cy="12.5" r=".9" />
    </>
  ),
  garlicBread: (
    <>
      <path d="M4 13.5a8 8 0 0 1 16 0v3.4a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 16.9Z" />
      <path d="m8 7.6 1.6 1.6M11.5 6.8l1.6 1.6M15 7.4l1.4 1.4" />
    </>
  ),
  rings: (
    <>
      <circle cx="9" cy="14.5" r="4.6" />
      <circle cx="15.5" cy="10" r="3.8" />
      <circle cx="16.5" cy="16.8" r="2.8" />
    </>
  ),
  platter: (
    <>
      <circle cx="12" cy="12.5" r="8.5" />
      <circle cx="9" cy="10.5" r="1.7" />
      <circle cx="15" cy="10.5" r="1.7" />
      <circle cx="12" cy="15.5" r="1.7" />
    </>
  ),
  taco: (
    <>
      <path d="M3.5 17a8.5 8.5 0 0 1 17 0Z" />
      <circle cx="8" cy="12.8" r="1" />
      <circle cx="12" cy="11.4" r="1" />
      <circle cx="16" cy="12.8" r="1" />
    </>
  ),
  drumstick: (
    <>
      <circle cx="14" cy="9.5" r="5.2" />
      <path d="M10.6 13.5 6.2 17.9" />
      <circle cx="5" cy="18.8" r="1.3" />
      <circle cx="7" cy="20.6" r="1.3" />
    </>
  ),
  fish: (
    <>
      <path d="M20.5 12.5c0 3.2-4 6-8 6-3 0-5.8-1.6-7.3-3.5L2.8 18V7l2.4 3c1.5-1.9 4.3-3.5 7.3-3.5 4 0 8 2.8 8 6Z" />
      <circle cx="17" cy="11.4" r=".7" />
    </>
  ),
  prawn: (
    <>
      <path d="M17.5 6.5a7 7 0 1 0-5.2 11.8" />
      <path d="M9.4 6.6c.5 1.5.5 3 0 4.4M6.8 8.7c.4 1.1.4 2.2 0 3.3" />
      <path d="m18 6 3.2-2.2M18.4 7.8l3.4-.6" />
    </>
  ),
  skewer: (
    <>
      <path d="M4 20 20 4" />
      <circle cx="10" cy="14" r="2.3" />
      <circle cx="13.6" cy="10.4" r="2.3" />
      <circle cx="17.2" cy="6.8" r="2.3" />
    </>
  ),
  salad: (
    <>
      <path d="M4.5 12.5h15a7.5 7.5 0 0 1-15 0Z" />
      <path d="M8.5 12.5C8 9.5 9 7 11.5 5.8c.8 2 .6 4.6-.8 6.7" />
      <circle cx="14.5" cy="10.4" r="1.8" />
    </>
  ),
  soup: (
    <>
      <path d="M4.5 12.5h15a7.5 7.5 0 0 1-15 0Z" />
      <path d="M9.5 9c0-1 .8-1.2.8-2.2S9.5 5.6 9.5 4.6M13.7 9c0-1 .8-1.2.8-2.2s-.8-1.2-.8-2.2" />
    </>
  ),
  sandwich: (
    <>
      <path d="M4 18.5 12 6l8 12.5Z" />
      <path d="M7.2 18.5 12 11l4.8 7.5" />
    </>
  ),
  burger: (
    <>
      <path d="M4.5 11c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6Z" />
      <path d="M4.5 14h15" />
      <path d="M5 17h14l-.2 1.2a2.4 2.4 0 0 1-2.4 2H7.6a2.4 2.4 0 0 1-2.4-2Z" />
      <path d="m8.8 8.2.6.3M12 7.4v.6M15.2 8.2l-.6.3" />
    </>
  ),
  pizza: (
    <>
      <path d="M12 21 5.2 5.6C9.5 3.4 14.5 3.4 18.8 5.6Z" />
      <path d="M6.1 7.7c3.7-1.9 8.1-1.9 11.8 0" />
      <circle cx="11" cy="10" r="1.3" />
      <circle cx="13.2" cy="13.8" r="1.2" />
    </>
  ),
  pasta: (
    <>
      <circle cx="12" cy="14.5" r="7" />
      <circle cx="12" cy="14.5" r="3" />
      <path d="M10.8 2.5v3.2M13.2 2.5v3.2M12 2.5V8" />
    </>
  ),
  riceBowl: (
    <>
      <path d="M4.5 13h15a7.5 7.5 0 0 1-15 0Z" />
      <path d="M7.4 13c0-2.6 2-4.2 4.6-4.2s4.6 1.6 4.6 4.2" />
    </>
  ),
  plateCutlery: (
    <>
      <circle cx="12" cy="12.5" r="6.2" />
      <circle cx="12" cy="12.5" r="3.6" />
      <path d="M3.4 6.5v12M2.2 6.5v2.6a1.2 1.2 0 0 0 2.4 0V6.5" />
      <path d="M20.6 18.5v-12c-1.2.6-1.9 2-1.9 3.4 0 1.2.8 2 1.9 2.4" />
    </>
  ),
};

/** Keyword rules, first match wins. Tested against `id + name`, lowercased. */
const RULES: [RegExp, IconKey][] = [
  [/soup/, "soup"],
  [/smoothie bowl/, "smoothieBowl"],
  [/risotto|bowl/, "riceBowl"],
  [/salad/, "salad"],
  [/affogato/, "sundae"],
  [/matcha/, "matcha"],
  [/brewccino|shake/, "frappe"],
  [/smoothie/, "frappe"],
  [/pour over|v60|vietnamese/, "dripper"],
  [/french press/, "frenchPress"],
  [/hot chocolate/, "hotChoc"],
  [/espresso tonic|cold brew|spritzer|wearenuts|blackpink|cooler/, "icedGlass"],
  [/iced tea|mojito|lemonade|jamun|g&g|blueberry pop|soda/, "soda"],
  [/yuzu/, "icedGlass"],
  [/aerated|red bull/, "can"],
  [/kombucha/, "bottle"],
  [/\btea\b|chai/, "teacup"],
  [/juice|detox/, "juice"],
  [/latté|\blatte\b|cappuccino|flat white|cortado|macchiato|mocha|bombon/, "coffeeCup"],
  [/\biced\b/, "icedGlass"],
  [/pancake/, "pancakes"],
  [/waffle/, "waffle"],
  [/churros/, "churros"],
  [/bagel/, "bagel"],
  [/skillet|baked eggs|omelette/, "skillet"],
  [/toast/, "toast"],
  [/\beggs?\b|benedict/, "friedEgg"],
  [/burrito|shawarma|wrap/, "wrap"],
  [/fries/, "fries"],
  [/nachos/, "nachos"],
  [/garlic bread|focaccia/, "garlicBread"],
  [/onion rings/, "rings"],
  [/mezze|platter/, "platter"],
  [/taco/, "taco"],
  [/fish/, "fish"],
  [/prawn/, "prawn"],
  [/skewer|satay/, "skewer"],
  [/tenders|from the grill/, "drumstick"],
];

/** Fallback icon per category when no keyword matches. */
const CATEGORY_DEFAULTS: Record<string, IconKey> = {
  "espresso-classics": "espresso",
  "signature-coffee": "coffeeCup",
  "brewccino-cold-brew": "frappe",
  "matcha-slow-brew": "matcha",
  "tea-hot-chocolate": "teacup",
  "smoothies-shakes-juices": "frappe",
  refreshers: "soda",
  "set-breakfast": "friedEgg",
  "lazy-brekkie-club": "friedEgg",
  toasted: "toast",
  "small-plates": "platter",
  "taqueria-grill": "drumstick",
  "salads-soups": "salad",
  sandwiches: "sandwich",
  burgers: "burger",
  pizzeria: "pizza",
  pasta: "pasta",
  "full-plates": "plateCutlery",
};

function iconFor(item: MenuItem, categoryId: string): IconKey {
  const haystack = `${item.id} ${item.name}`.toLowerCase();
  for (const [re, key] of RULES) {
    if (re.test(haystack)) return key;
  }
  return CATEGORY_DEFAULTS[categoryId] ?? "plateCutlery";
}

export default function FoodIcon({ item, categoryId }: { item: MenuItem; categoryId: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="34"
      height="34"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {ICONS[iconFor(item, categoryId)]}
    </svg>
  );
}
