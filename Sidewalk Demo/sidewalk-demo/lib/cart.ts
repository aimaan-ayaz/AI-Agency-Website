import type { MenuItem } from "@/data/menu";
import { brand } from "@/data/brand";

export type Variant = "Hot" | "Iced";

export interface CartLine {
  /** Unique per item + variant, e.g. "latte:Iced" */
  key: string;
  item: MenuItem;
  variant?: Variant;
  unitPrice: number;
  qty: number;
}

export function lineKey(item: MenuItem, variant?: Variant) {
  return variant ? `${item.id}:${variant}` : item.id;
}

export function cartCount(lines: CartLine[]) {
  return lines.reduce((n, l) => n + l.qty, 0);
}

export function cartTotal(lines: CartLine[]) {
  return lines.reduce((n, l) => n + l.qty * l.unitPrice, 0);
}

export function formatPrice(amount: number) {
  return `${brand.currency}${amount.toLocaleString("en-IN")}`;
}
