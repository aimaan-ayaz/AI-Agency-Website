"use client";

import { ReactNode } from "react";
import CornerBrackets from "./CornerBrackets";

/**
 * Glass panel — monochrome, hairline border, quiet power-on (a rise +
 * a thin top hairline drawing in). Corner ticks are off by default;
 * enable only where a panel benefits from the HUD cue.
 */
export default function HudPanel({
  children,
  className = "",
  brackets = false,
  powerOn = true,
}: {
  children: ReactNode;
  className?: string;
  brackets?: boolean;
  powerOn?: boolean;
}) {
  return (
    <div className={`j-panel ${powerOn ? "j-power-on" : ""} ${className}`}>
      {brackets && <CornerBrackets />}
      <div className="relative z-[1] h-full">{children}</div>
    </div>
  );
}
