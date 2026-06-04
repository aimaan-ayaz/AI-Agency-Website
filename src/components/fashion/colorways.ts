// The 4 user-switchable colourways (SPEC §5.2). Switching a colourway sets
// the shirt material's base colour. Onyx is intentionally a soft/washed black
// (not pure #000) so it reads premium and renders with visible weave.

export interface Colorway {
  name: string;
  hex: string;
  /** true = light fabric → the Z mark and prints want a dark ink for contrast */
  light: boolean;
}

export const COLORWAYS: Colorway[] = [
  { name: "Black", hex: "#151515", light: false },
  { name: "White", hex: "#F4F4F2", light: true },
];

/** Ink colour for the permanent Z mark so it stays legible on every colourway. */
export function zInkFor(colorway: Colorway): string {
  return colorway.light ? "#0a0a0a" : "#F6F3EC";
}
