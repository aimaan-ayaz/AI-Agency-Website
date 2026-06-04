import { useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

// Matte-cotton PBR maps — Poly Haven "Fabric Pattern 07" (CC0). We use only the
// grayscale weave data (normal / roughness / AO); the shirt's actual colour
// comes from material.color (the colourway), so the textured albedo is ignored.
//
// colorSpace: these are DATA maps, so NoColorSpace (linear) in three r0.169.
// The base-colour comes from `color`, and decal art is tagged SRGBColorSpace
// where it's created (canvas-textures.ts).

const SHIRT_REPEAT = 7; // coarser, clearly-visible weave grain — matte cotton, not plastic
const DECAL_REPEAT = 4; // coarser on the print so its weave reads at print scale

export interface FabricMaps {
  normalMap: THREE.Texture;
  roughnessMap: THREE.Texture;
  aoMap: THREE.Texture;
  /** A separate clone of the weave normal for decals (own repeat). */
  decalNormalMap: THREE.Texture;
}

export function useFabricTextures(lowPerf = false): FabricMaps {
  const [normalMap, roughnessMap, aoMap] = useTexture([
    "/textures/fabric/fabric_nor_gl_1k.jpg",
    "/textures/fabric/fabric_rough_1k.jpg",
    "/textures/fabric/fabric_ao_1k.jpg",
  ]);

  const maps = useMemo(() => {
    const aniso = lowPerf ? 2 : 8; // phones: cheaper sampling
    for (const t of [normalMap, roughnessMap, aoMap]) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(SHIRT_REPEAT, SHIRT_REPEAT);
      t.colorSpace = THREE.NoColorSpace;
      t.anisotropy = aniso;
      t.needsUpdate = true;
    }

    const decalNormalMap = normalMap.clone();
    decalNormalMap.wrapS = decalNormalMap.wrapT = THREE.RepeatWrapping;
    decalNormalMap.repeat.set(DECAL_REPEAT, DECAL_REPEAT);
    decalNormalMap.colorSpace = THREE.NoColorSpace;
    decalNormalMap.needsUpdate = true;

    return { normalMap, roughnessMap, aoMap, decalNormalMap };
  }, [normalMap, roughnessMap, aoMap, lowPerf]);

  // decalNormalMap is a clone WE own (drei doesn't manage it) — dispose it when
  // it's replaced (lowPerf toggle / source reload) or on unmount so it can't leak.
  useEffect(() => () => maps.decalNormalMap.dispose(), [maps.decalNormalMap]);

  return maps;
}
