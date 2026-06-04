import * as THREE from "three";

// Procedural decal art drawn to a <canvas> → THREE.CanvasTexture. Keeps Phase 1
// free of binary image assets and lets the Z mark recolour per colourway.
// (Same CanvasTexture technique the JARVIS ParticleField uses for its sprite.)

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function toTexture(c: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; // a colour map, not data
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Orientation-aware calibration graphic: a bordered box, an up-arrow, the zone
 * label, and a "TOP" marker — so it's obvious at a glance whether a decal sits
 * in the right place, the right size, and the right way up in each of the 5 zones.
 */
export function makeTestZoneTexture(label: string): THREE.CanvasTexture {
  const S = 512;
  const c = makeCanvas(S, S);
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, S, S);

  const accent = "#FF4632";

  // border
  ctx.strokeStyle = accent;
  ctx.lineWidth = 16;
  ctx.strokeRect(48, 48, S - 96, S - 96);

  // up-arrow (orientation check)
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(S / 2, 96);
  ctx.lineTo(S / 2 - 62, 214);
  ctx.lineTo(S / 2 + 62, 214);
  ctx.closePath();
  ctx.fill();

  // label
  ctx.fillStyle = accent;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 58px system-ui, sans-serif";
  ctx.fillText(label.toUpperCase(), S / 2, S / 2 + 28);

  ctx.font = "700 40px system-ui, sans-serif";
  ctx.fillText("▲ TOP", S / 2, S - 124);

  return toTexture(c);
}
