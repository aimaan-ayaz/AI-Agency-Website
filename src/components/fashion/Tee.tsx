"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { useGLTF, useTexture, Decal } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { useFabricTextures } from "@/lib/fashion/useFabricTextures";
import { makeTestZoneTexture } from "@/lib/fashion/canvas-textures";
import { ZONES, ZONE_LABELS, ZoneName, Vec3 } from "./decal-zones";
import { Colorway } from "./colorways";

export interface PlacedDesign {
  id: string;
  image: string; // transparent-PNG data URL
  image_prompt: string;
  placement: ZoneName;
  scale: "s" | "m" | "l";
  scaleFactor?: number;
}

const SCALE_MUL: Record<PlacedDesign["scale"], number> = { s: 0.78, m: 1, l: 1.24 };

const MODEL = "/models/tee.gltf";
const TARGET_HEIGHT = 1.7; // normalised shirt height in world units
const BASE_ROTATION_Y = 0; // source model faces +Z

// Reveal sweep bounds in world Y (geometry is centred → ±TARGET_HEIGHT/2).
const TEE_MIN_Y = -TARGET_HEIGHT / 2;
const REVEAL_SECONDS = 0.85;

useGLTF.preload(MODEL);

type RevealUniform = { value: number };
type Patchable = THREE.Material & {
  onBeforeCompile: THREE.Material["onBeforeCompile"];
  customProgramCacheKey: () => string;
};

// Shared shader patch: a bottom-to-top pixelated dissolve gated by a uReveal
// uniform, applied to BOTH the shirt and every print — so the whole tee
// re-materialises from the hem up when a new graphic is generated.
function applyRevealPatch(m: Patchable, uniform: RevealUniform, key: string) {
  m.customProgramCacheKey = () => key;
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uReveal = uniform;
    shader.vertexShader = shader.vertexShader
      .replace("void main() {", "varying float vRevealY;\nvoid main() {")
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\n  vRevealY = (modelMatrix * vec4(transformed, 1.0)).y;"
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("void main() {", "uniform float uReveal;\nvarying float vRevealY;\nvoid main() {")
      .replace(
        "#include <clipping_planes_fragment>",
        `#include <clipping_planes_fragment>
         {
           float _ny = clamp((vRevealY - (${TEE_MIN_Y.toFixed(4)})) / ${TARGET_HEIGHT.toFixed(4)}, 0.0, 1.0);
           vec2 _cell = floor(gl_FragCoord.xy / 6.0);
           float _h = fract(sin(dot(_cell, vec2(12.9898, 78.233))) * 43758.5453);
           float _band = 0.16;
           float _threshold = uReveal * (1.0 + _band);
           if (_ny + _h * _band > _threshold) discard;
         }`
      );
  };
}

// One generated graphic, projected as a woven-in decal. Shares the tee-wide
// reveal uniform so it dissolves in as part of the whole-tee sweep.
function DesignDecal({
  design,
  normalMap,
  normalScale,
  reveal,
  lowPerf,
}: {
  design: PlacedDesign;
  normalMap: THREE.Texture;
  normalScale: THREE.Vector2;
  reveal: RevealUniform;
  lowPerf: boolean;
}) {
  const tex = useTexture(design.image);
  const zone = ZONES[design.placement];

  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = lowPerf ? 2 : 16;
    if (zone.flipU) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.repeat.x = -1;
      tex.offset.x = 1;
    }
    tex.needsUpdate = true;
  }, [tex, zone, lowPerf]);

  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      map: tex,
      normalMap,
      normalScale,
      roughness: 1,
      metalness: 0,
      envMapIntensity: 0.05,
      transparent: true,
      polygonOffset: true,
      polygonOffsetFactor: -10,
    });
    applyRevealPatch(m, reveal, `zfashion-print-${design.id}`);
    return m;
  }, [tex, normalMap, normalScale, reveal, design.id]);

  useEffect(() => () => material.dispose(), [material]);
  // Each print is a one-off data URL — release its GPU texture and loader-cache
  // entry on unmount so a long session of generations doesn't leak VRAM.
  useEffect(
    () => () => {
      tex.dispose();
      try {
        useTexture.clear(design.image);
      } catch {
        /* cache key already gone */
      }
    },
    [tex, design.image]
  );

  const mul = (SCALE_MUL[design.scale] ?? 1) * (design.scaleFactor ?? 1);
  const scale: Vec3 = [zone.scale[0] * mul, zone.scale[1] * mul, zone.scale[2]];

  return (
    <Decal position={zone.position} rotation={zone.rotation} scale={scale}>
      <primitive object={material} attach="material" />
    </Decal>
  );
}

/**
 * Merge the tee meshes into one geometry, then centre + scale to TARGET_HEIGHT.
 * Clean single-sided thin shell (no inflation).
 */
function useMergedTeeGeometry(): THREE.BufferGeometry {
  const { scene } = useGLTF(MODEL);
  return useMemo(() => {
    scene.updateMatrixWorld(true);
    const geos: THREE.BufferGeometry[] = [];

    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || !mesh.geometry) return;
      const src = mesh.geometry;
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", src.attributes.position.clone());
      if (src.attributes.normal) g.setAttribute("normal", src.attributes.normal.clone());
      if (src.attributes.uv) g.setAttribute("uv", src.attributes.uv.clone());
      if (src.index) g.setIndex(src.index.clone());
      const flat = g.toNonIndexed();
      flat.applyMatrix4(mesh.matrixWorld);
      geos.push(flat);
    });

    let merged = geos.length > 1 ? mergeGeometries(geos, false) : geos[0];
    if (!merged) merged = new THREE.BufferGeometry();

    merged.computeBoundingBox();
    const center = new THREE.Vector3();
    merged.boundingBox!.getCenter(center);
    merged.translate(-center.x, -center.y, -center.z);

    merged.computeBoundingBox();
    const size = new THREE.Vector3();
    merged.boundingBox!.getSize(size);
    const s = size.y > 0 ? TARGET_HEIGHT / size.y : 1;
    merged.scale(s, s, s);

    if (merged.attributes.uv) {
      merged.setAttribute("uv1", (merged.attributes.uv as THREE.BufferAttribute).clone());
    }
    merged.computeBoundingSphere();
    return merged;
  }, [scene]);
}

export interface TeeProps {
  colorway: Colorway;
  designs?: PlacedDesign[];
  /** bumps each time a graphic is generated → triggers the whole-tee reveal */
  revealNonce?: number;
  /** phones: lighter texture sampling (lower anisotropy) for weak GPUs */
  lowPerf?: boolean;
  testZone?: ZoneName | "none";
}

export function Tee({
  colorway,
  designs = [],
  revealNonce = 0,
  lowPerf = false,
  testZone = "none",
}: TeeProps) {
  const geometry = useMergedTeeGeometry();
  const { normalMap, roughnessMap, aoMap, decalNormalMap } = useFabricTextures(lowPerf);
  // frameloop is "demand" — request a render whenever the tee actually changes.
  const invalidate = useThree((s) => s.invalidate);

  // Shared reveal state (1 = fully shown). Bumped to 0 then animated to 1 on
  // each new generation so the whole tee materialises bottom-up.
  const reveal = useRef<RevealUniform>({ value: 1 });
  const animating = useRef(false);
  const startT = useRef<number | null>(null);
  const prevNonce = useRef(revealNonce);

  // Shirt material — built imperatively so the reveal patch reliably compiles in.
  const shirtMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: colorway.hex,
      normalMap,
      normalScale: new THREE.Vector2(1.5, 1.5),
      roughnessMap,
      roughness: 1,
      metalness: 0,
      aoMap,
      aoMapIntensity: 1,
      envMapIntensity: 0.03,
    });
    applyRevealPatch(m, reveal.current, "zfashion-shirt");
    return m;
  }, [normalMap, roughnessMap, aoMap]);
  useEffect(() => {
    shirtMat.color.set(colorway.hex);
  }, [shirtMat, colorway.hex]);
  useEffect(() => () => shirtMat.dispose(), [shirtMat]);

  // Trigger the sweep when a new graphic is generated (skip initial mount).
  useEffect(() => {
    if (revealNonce !== prevNonce.current) {
      prevNonce.current = revealNonce;
      reveal.current.value = 0;
      startT.current = null;
      animating.current = true;
      invalidate(); // kick the on-demand loop so the sweep starts rendering
    }
  }, [revealNonce, invalidate]);

  useFrame((state) => {
    if (!animating.current) return;
    if (startT.current === null) startT.current = state.clock.elapsedTime;
    const p = Math.min(1, (state.clock.elapsedTime - startT.current) / REVEAL_SECONDS);
    reveal.current.value = p;
    if (p >= 1) animating.current = false;
    state.invalidate(); // self-sustain frames through the sweep under frameloop="demand"
  });

  const testTexture = useMemo(() => {
    if (testZone === "none") return null;
    const t = makeTestZoneTexture(ZONE_LABELS[testZone]);
    if (ZONES[testZone].flipU) {
      t.wrapS = THREE.RepeatWrapping;
      t.repeat.x = -1;
      t.offset.x = 1;
    }
    return t;
  }, [testZone]);

  const decalNormalScale = useMemo(() => new THREE.Vector2(0.35, 0.35), []);
  const zone = testZone !== "none" ? ZONES[testZone] : null;

  useEffect(() => {
    const w = window as Window & {
      __fashionReady?: boolean;
      __fashionRevealHold?: (v: number) => void;
    };
    w.__fashionReady = true;
    invalidate(); // paint the tee once it's mounted (frameloop="demand")
    // Dev/verification: freeze the reveal at a fixed level (0..1).
    w.__fashionRevealHold = (v: number) => {
      animating.current = false;
      reveal.current.value = v;
      invalidate();
    };
    return () => {
      w.__fashionReady = false;
    };
  }, [geometry, invalidate]);

  return (
    <group rotation={[0, BASE_ROTATION_Y, 0]}>
      <mesh geometry={geometry} material={shirtMat} dispose={null}>
        {/* AI-generated graphics — each shares the tee-wide reveal. */}
        {designs.map((d) => (
          <Suspense key={d.id} fallback={null}>
            <DesignDecal
              design={d}
              normalMap={decalNormalMap}
              normalScale={decalNormalScale}
              reveal={reveal.current}
              lowPerf={lowPerf}
            />
          </Suspense>
        ))}

        {/* Calibration graphic — dev/verification only. */}
        {zone && testTexture && (
          <Decal position={zone.position} rotation={zone.rotation} scale={zone.scale}>
            <meshStandardMaterial
              map={testTexture}
              normalMap={decalNormalMap}
              normalScale={decalNormalScale}
              roughness={1}
              metalness={0}
              transparent
              polygonOffset
              polygonOffsetFactor={-10}
            />
          </Decal>
        )}
      </mesh>
    </group>
  );
}
