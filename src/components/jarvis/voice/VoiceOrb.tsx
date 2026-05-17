"use client";

import { memo, useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type OrbState = "idle" | "listening" | "processing" | "speaking";

// Monochrome "contained energy" sphere. Premium, not neon: a dark
// metallic core with a luminous fresnel rim, a fine particle halo and
// one thin orbiting ring. Everything is white / cold-white; it reacts
// to JARVIS's state and (while listening) to live mic amplitude.

const ACCENT = new THREE.Color("#cfe4f5"); // the one cold accent
const WHITE = new THREE.Color("#ffffff");

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function Sphere({
  state,
  levelRef,
}: {
  state: OrbState;
  levelRef: MutableRefObject<number>;
}) {
  const core = useRef<THREE.Mesh>(null);
  const rim = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Points>(null);
  const emiss = useRef(0.12);
  const scaleRef = useRef(1);

  const haloPos = useMemo(() => {
    const N = 280;
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      // points scattered on a spherical shell
      const r = 1.55 + Math.random() * 0.5;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(ph) * Math.cos(th);
      arr[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      arr[i * 3 + 2] = r * Math.cos(ph);
    }
    return arr;
  }, []);

  const sprite = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 32;
    const x = c.getContext("2d")!;
    const g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "rgba(255,255,255,0.95)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 32, 32);
    const t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    return t;
  }, []);

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime;
    const lvl = levelRef.current;

    // Per-state targets
    let targetEmiss = 0.12;
    let rotSpeed = 0.15;
    let targetScale = 1;
    let tint = 0; // 0 = white, 1 = cold accent

    if (state === "idle") {
      targetEmiss = 0.12 + Math.sin(t * 1.2) * 0.04;
      targetScale = 1 + Math.sin(t * 1.1) * 0.015;
    } else if (state === "listening") {
      // `lvl` is 0 in Phase 3a (no parallel mic capture) — drive a
      // clear autonomous "I'm hearing you" pulse; amplitude reactivity
      // returns in Phase 3b with Deepgram's single controlled stream.
      const breathe = Math.sin(t * 3.1) * 0.06 + Math.sin(t * 1.7) * 0.03;
      targetEmiss = 0.42 + lvl * 0.6 + breathe;
      targetScale = 1 + lvl * 0.22 + breathe * 1.6;
      rotSpeed = 0.45 + lvl * 0.8;
      tint = 0.4;
    } else if (state === "processing") {
      targetEmiss = 0.28 + Math.sin(t * 7) * 0.1;
      rotSpeed = 1.5;
      targetScale = 1 + Math.sin(t * 6) * 0.02;
      tint = 0.6;
    } else if (state === "speaking") {
      const pulse = (Math.sin(t * 9) + Math.sin(t * 5.3)) * 0.5;
      targetEmiss = 0.55 + pulse * 0.3;
      targetScale = 1.04 + pulse * 0.04;
      rotSpeed = 0.5;
      tint = 0.2;
    }

    emiss.current = lerp(emiss.current, targetEmiss, 0.12);
    scaleRef.current = lerp(scaleRef.current, targetScale, 0.18);
    const col = WHITE.clone().lerp(ACCENT, tint);

    if (core.current) {
      core.current.rotation.y += dt * rotSpeed;
      core.current.rotation.x += dt * rotSpeed * 0.35;
      core.current.scale.setScalar(scaleRef.current);
      const m = core.current.material as THREE.MeshStandardMaterial;
      m.emissive.copy(col);
      m.emissiveIntensity = emiss.current;
    }
    if (rim.current) {
      rim.current.scale.setScalar(scaleRef.current * 1.13);
      const m = rim.current.material as THREE.MeshBasicMaterial;
      m.color.copy(col);
      m.opacity = 0.08 + emiss.current * 0.22;
    }
    if (ring.current) {
      ring.current.rotation.z += dt * (0.2 + rotSpeed * 0.3);
      ring.current.rotation.x = Math.PI / 2.6;
      const m = ring.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.12 + emiss.current * 0.3;
    }
    if (halo.current) {
      halo.current.rotation.y -= dt * (0.05 + rotSpeed * 0.08);
      halo.current.scale.setScalar(
        lerp(halo.current.scale.x, 1 + (emiss.current - 0.12) * 0.3, 0.1)
      );
      const m = halo.current.material as THREE.PointsMaterial;
      m.opacity = 0.18 + emiss.current * 0.35;
    }
  });

  return (
    <group>
      {/* dark metallic core */}
      <mesh ref={core}>
        <icosahedronGeometry args={[1, 4]} />
        <meshStandardMaterial
          color="#0c0c0e"
          metalness={0.55}
          roughness={0.38}
          emissive="#ffffff"
          emissiveIntensity={0.12}
        />
      </mesh>
      {/* luminous fresnel-ish rim shell */}
      <mesh ref={rim}>
        <icosahedronGeometry args={[1, 3]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* thin orbiting ring */}
      <mesh ref={ring}>
        <torusGeometry args={[1.85, 0.006, 6, 72]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
      </mesh>
      {/* particle halo */}
      <points ref={halo}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[haloPos, 3]}
            count={haloPos.length / 3}
          />
        </bufferGeometry>
        <pointsMaterial
          map={sprite}
          size={0.045}
          sizeAttenuation
          transparent
          depthWrite={false}
          opacity={0.25}
          color="#ffffff"
        />
      </points>
    </group>
  );
}

function VoiceOrb({
  state,
  levelRef,
}: {
  state: OrbState;
  levelRef: MutableRefObject<number>;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.6], fov: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={0.35} />
      <pointLight position={[3, 4, 5]} intensity={1.1} color="#ffffff" />
      <pointLight position={[-4, -2, -3]} intensity={0.4} color="#cfe4f5" />
      <Sphere state={state} levelRef={levelRef} />
    </Canvas>
  );
}

// Memoized: levelRef is a stable ref and `state` only changes on phase
// transitions, so transcript/partial updates never re-render the orb.
export default memo(VoiceOrb);
