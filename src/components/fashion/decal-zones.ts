// Named placement presets (SPEC §4.1). Each zone is a { position, rotation,
// scale } transform in the tee's NORMALISED local space — the model is merged,
// centred on the origin, and scaled so its height = TARGET_HEIGHT (see Tee.tsx).
//
// These transforms are MODEL-SPECIFIC and calibrated by eye for tee.gltf.
// `rotation` is optional: when omitted, drei's <Decal> auto-orients the print
// to the closest surface normal (correct for front, back and sleeve faces).
// `scale` is [width, height, projectionDepth] — depth must be deep enough to
// cut through the fabric shell or the decal won't render.

export type Vec3 = [number, number, number];

export interface ZonePreset {
  position: Vec3;
  rotation?: Vec3;
  scale: Vec3;
  /**
   * Mirror the print horizontally. DecalGeometry's projected UVs are
   * left-handed when projecting along +X, so that face needs a U-flip to read
   * correctly. (Front/back/−X sleeve don't.)
   */
  flipU?: boolean;
}

export type ZoneName =
  | "front_chest"
  | "front_full"
  | "back_center"
  | "left_sleeve"
  | "right_sleeve";

export const ZONE_ORDER: ZoneName[] = [
  "front_chest",
  "front_full",
  "back_center",
  "left_sleeve",
  "right_sleeve",
];

export const ZONE_LABELS: Record<ZoneName, string> = {
  front_chest: "Front chest",
  front_full: "Full front",
  back_center: "Centre back",
  left_sleeve: "Left sleeve",
  right_sleeve: "Right sleeve",
};

// Calibrated against renders. Front faces +Z. Rotations are EXPLICIT (not
// auto-oriented) so the print is never mirrored/flipped: front faces +Z,
// back is spun 180° about Y, sleeves face ±X. Projection depth (scale.z) is
// generous so the box cuts cleanly through the fabric shell.
const PI = Math.PI;

export const ZONES: Record<ZoneName, ZonePreset> = {
  front_chest: { position: [0.0, 0.4, 0.35], rotation: [0, 0, 0], scale: [0.32, 0.32, 0.7] },
  // Default house print: bold, centred, spanning the chest down to above the
  // navel (~75% of the front, kept inside the torso silhouette). Near-square so
  // the squared art isn't distorted. Customer resizes from here with the slider.
  front_full: { position: [0.0, 0.15, 0.35], rotation: [0, 0, 0], scale: [0.74, 0.8, 0.85] },
  back_center: { position: [0.0, 0.04, -0.35], rotation: [0, PI, 0], scale: [0.86, 1.04, 0.8] },
  left_sleeve: { position: [0.55, 0.42, 0.08], rotation: [0, -PI / 2, 0], scale: [0.22, 0.22, 0.4] },
  right_sleeve: { position: [-0.55, 0.42, 0.08], rotation: [0, PI / 2, 0], scale: [0.22, 0.22, 0.4], flipU: true },
};

// The permanent Z brand mark — small, left chest, present on every shirt and
// colourway, not user-editable (SPEC §5.1). One transform so it's easy to move.
export const Z_MARK: ZonePreset = {
  position: [0.17, 0.45, 0.34],
  rotation: [0, 0, 0],
  scale: [0.24, 0.24, 0.6], // square box; the wide ZAID wordmark sits centred within
};
