"use client";

import { Colorway, COLORWAYS } from "./colorways";

interface Props {
  active: Colorway;
  onChange: (c: Colorway) => void;
}

// Minimal, elegant 4-swatch switcher (SPEC §5.2). Sets the shirt base colour.
export function ColorwaySwitcher({ active, onChange }: Props) {
  return (
    <div className="flex items-center gap-4">
      {COLORWAYS.map((c) => {
        const isActive = c.name === active.name;
        return (
          <button
            key={c.name}
            type="button"
            onClick={() => onChange(c)}
            aria-label={c.name}
            aria-pressed={isActive}
            title={c.name}
            className="group relative flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-300 hover:scale-110"
          >
            <span
              className="h-7 w-7 rounded-full ring-1 ring-white/15"
              style={{ backgroundColor: c.hex }}
            />
            <span
              className={`pointer-events-none absolute inset-0 rounded-full ring-1 transition-all duration-300 ${
                isActive ? "ring-white/80 scale-110" : "ring-transparent scale-100"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
