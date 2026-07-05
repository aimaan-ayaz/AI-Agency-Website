/**
 * ════════════════════════════════════════════════════════════
 *  SIDEWALK — BRANDING CONFIG
 *  Everything brand-related lives here, EXCEPT colors & fonts,
 *  which live in `app/globals.css` (the "@theme" block at the
 *  top — clearly marked). Edit either file, nothing else.
 * ════════════════════════════════════════════════════════════
 */
export const brand = {
  name: "Sidewalk",
  tagline: "Community inspired café",
  welcome: "Welcome home",

  /** Logo file — lives in /public. Swap the file to change it. */
  logoAlt: "Sidewalk",

  currency: "₹",

  /** Used when the QR link has no ?table= param. */
  defaultTable: "4",

  /** Shown on the confirmation screen. */
  estimatedTime: "15–20 min",

  /** Fine print shown in the cart (taken from the real menu). */
  finePrint:
    "All prices are in INR | 5% optional service charge | Government taxes as applicable | Please inform staff of any allergies.",
} as const;
