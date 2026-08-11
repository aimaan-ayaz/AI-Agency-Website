"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Canvas, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  ContactShadows,
  OrbitControls,
} from "@react-three/drei";
import * as THREE from "three";
import { Tee, type PlacedDesign } from "./Tee";
import { COLORWAYS, Colorway } from "./colorways";
import { ZONE_ORDER, ZONE_LABELS, ZoneName } from "./decal-zones";

const EASE = [0.22, 1, 0.36, 1] as const;
const SIZES = ["XS", "S", "M", "L", "XL"] as const;
const PRICE = "$120";
const EXAMPLES = ["tribal flames", "a snarling wolf"];

function generateError(code?: string, message?: string) {
  if (message) return message;
  if (code === "rate_limit") return "Too many prints — give it a moment.";
  if (code === "unconfigured") return "Image generation isn't configured.";
  return "Couldn't generate the graphic. Try again.";
}
function designError(code?: string) {
  if (code === "rate_limit") return "Too many requests — give it a moment.";
  if (code === "unconfigured") return "The design service isn't configured.";
  return "Couldn't reach the design director. Try again.";
}

interface IncomingDesign {
  id: string;
  image_prompt: string;
  placement: ZoneName;
  scale: "s" | "m" | "l";
}

interface ViewSpec {
  radius: number;
  azimuthDeg: number;
  polarDeg: number;
}

const VIEW_PRESETS: Record<string, ViewSpec> = {
  tq: { radius: 4.7, azimuthDeg: 26, polarDeg: 84 },
  front: { radius: 4.5, azimuthDeg: 0, polarDeg: 89 },
  back: { radius: 4.5, azimuthDeg: 180, polarDeg: 89 },
  left: { radius: 4.6, azimuthDeg: 60, polarDeg: 84 },
  right: { radius: 4.6, azimuthDeg: -60, polarDeg: 84 },
};

function CameraRig({
  view,
  radiusScale = 1,
  targetY = 0,
}: {
  view: ViewSpec;
  radiusScale?: number;
  targetY?: number;
}) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as
    | { target: THREE.Vector3; update: () => void }
    | null;
  useEffect(() => {
    const phi = THREE.MathUtils.degToRad(view.polarDeg);
    const theta = THREE.MathUtils.degToRad(view.azimuthDeg);
    const pos = new THREE.Vector3().setFromSpherical(
      new THREE.Spherical(view.radius * radiusScale, phi, theta)
    );
    // Lift the framing: looking slightly below centre floats the tee higher in
    // frame, clearing the bottom prompt/controls (no scrim needed).
    pos.y += targetY;
    camera.position.copy(pos);
    camera.lookAt(0, targetY, 0);
    if (controls) {
      controls.target.set(0, targetY, 0);
      controls.update();
    }
  }, [view, camera, controls, radiusScale, targetY]);
  return null;
}

function useIsMobile() {
  const [m, setM] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 640px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const on = () => setM(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return m;
}

// frameloop="demand" keeps the GPU idle unless something changes. Request a
// render whenever a scene-affecting input changes (colour, camera, prints).
function SceneInvalidator({
  colorway,
  view,
  designs,
  testZone,
}: {
  colorway: Colorway;
  view: ViewSpec;
  designs: PlacedDesign[];
  testZone: ZoneName | "none";
}) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
  }, [invalidate, colorway, view, designs, testZone]);
  return null;
}

// Auto-rotate needs continuous frames; under frameloop="demand" we pump them
// with rAF only while it's active (desktop, pre-interaction). Off → GPU idles.
function AutoRotateDriver({ active }: { active: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const tick = () => {
      invalidate();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, invalidate]);
  return null;
}

export default function Studio() {
  const [colorway, setColorway] = useState<Colorway>(COLORWAYS[0]);
  const [size, setSize] = useState<(typeof SIZES)[number]>("M");
  const [notice, setNotice] = useState(false); // "ordering opens soon" modal
  const [view, setView] = useState<ViewSpec>(VIEW_PRESETS.tq);
  const [interacted, setInteracted] = useState(false);
  const [testZone, setTestZone] = useState<ZoneName | "none">("none");

  const [designs, setDesigns] = useState<PlacedDesign[]>([]);
  const [revealNonce, setRevealNonce] = useState(0); // bumps on generate → tee reveal sweep
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const isMobile = useIsMobile();
  const reduced = useReducedMotion();

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const cw = p.get("cw");
    if (cw) {
      const f = COLORWAYS.find((c) => c.name.toLowerCase() === cw.toLowerCase());
      if (f) setColorway(f);
    }
    const z = p.get("zone");
    if (z && (z === "none" || (ZONE_ORDER as string[]).includes(z))) {
      setTestZone(z as ZoneName | "none");
    }
    const demo = p.get("demo");
    if (demo && (ZONE_ORDER as string[]).includes(demo)) {
      setDesigns([
        {
          id: "demo",
          image: "/zaid-wordmark.png",
          image_prompt: "demo graphic",
          placement: demo as ZoneName,
          scale: "l",
        },
      ]);
    }
    const v = p.get("view");
    const spec: ViewSpec = { ...(v && VIEW_PRESETS[v] ? VIEW_PRESETS[v] : VIEW_PRESETS.tq) };
    const az = p.get("az");
    const pol = p.get("pol");
    const r = p.get("r");
    if (az !== null) spec.azimuthDeg = parseFloat(az);
    if (pol !== null) spec.polarDeg = parseFloat(pol);
    if (r !== null) spec.radius = parseFloat(r);
    setView(spec);
  }, []);

  // Dev/verification hook: replay the whole-tee reveal sweep on demand.
  useEffect(() => {
    (window as Window & { __fashionReveal?: () => void }).__fashionReveal = () =>
      setRevealNonce((n) => n + 1);
  }, []);
  // Dev/verification hook: how many prints are on the tee (poll for e2e tests).
  useEffect(() => {
    (window as Window & { __fashionDesignCount?: number }).__fashionDesignCount =
      designs.length;
  }, [designs]);

  function removeDesign(id: string) {
    setDesigns((cur) => cur.filter((d) => d.id !== id));
  }
  function setDesignScale(id: string, factor: number) {
    setDesigns((cur) =>
      cur.map((d) => (d.id === id ? { ...d, scaleFactor: factor } : d))
    );
  }

  // Phase 4 — upscale the on-tee graphics to print-ready PNGs and download a zip.
  async function exportPrints() {
    if (!designs.length || exporting) return;
    setExporting(true);
    setError(null);
    try {
      const r = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          designs: designs.map((d) => ({
            id: d.id,
            image: d.image,
            placement: d.placement,
            scaleFactor: d.scaleFactor ?? 1,
          })),
        }),
      });
      if (!r.ok) {
        setError("Couldn't prepare the print files. Try again.");
        return;
      }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "z-print-files.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Couldn't prepare the print files. Try again.");
    } finally {
      setExporting(false);
    }
  }
  useEffect(() => {
    if (selectedId && !designs.some((d) => d.id === selectedId)) {
      setSelectedId(designs.length ? designs[designs.length - 1].id : null);
    }
  }, [designs, selectedId]);

  async function submitPrompt(e?: React.FormEvent, override?: string) {
    e?.preventDefault();
    const msg = (override ?? prompt).trim();
    if (!msg || busy) return;
    setBusy(true);
    setError(null);
    try {
      const dr = await fetch("/api/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: msg,
          currentDesigns: designs.map((d) => ({
            id: d.id,
            image_prompt: d.image_prompt,
            placement: d.placement,
            scale: d.scale,
          })),
        }),
      });
      const data = await dr.json();
      if (!dr.ok) {
        setError(designError(data?.error));
        return;
      }
      setPrompt("");
      if (data.action === "reject") return;

      if (data.action === "remove") {
        const ids = new Set(
          ((data.designs as IncomingDesign[]) || []).map((d) => d.id)
        );
        setDesigns((cur) => cur.filter((d) => !ids.has(d.id)));
        return;
      }

      const incoming = (data.designs as IncomingDesign[]) || [];
      if (incoming.length === 0) return;

      const generated: PlacedDesign[] = [];
      for (const d of incoming) {
        const gr = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_prompt: d.image_prompt,
            placement: d.placement,
          }),
        });
        const gd = await gr.json();
        if (!gr.ok) {
          setError(generateError(gd?.error, gd?.message));
          continue;
        }
        generated.push({
          id: d.id,
          image: gd.image,
          image_prompt: d.image_prompt,
          placement: d.placement,
          scale: d.scale,
          scaleFactor: 1,
        });
      }
      if (generated.length === 0) return;

      setDesigns((cur) => {
        if (data.action === "replace_all") return generated;
        if (data.action === "modify") {
          const map = new Map(generated.map((g) => [g.id, g]));
          const merged = cur.map((d) => map.get(d.id) ?? d);
          for (const g of generated)
            if (!merged.find((d) => d.id === g.id)) merged.push(g);
          return merged;
        }
        return [...cur, ...generated];
      });
      setSelectedId(generated[generated.length - 1].id);
      setRevealNonce((n) => n + 1); // play the whole-tee materialise sweep
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const selectedDesign = designs.find((d) => d.id === selectedId) ?? null;
  const hasDesigns = designs.length > 0;
  // Only spin (and burn frames) on desktop before the first interaction; phones
  // stay idle for battery/thermals.
  const autoRotateActive = !interacted && !reduced && !isMobile;

  // staggered entrance for overlay blocks
  const rise = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, ease: EASE, delay },
        };

  const swatches = (
    <ControlGroup label={`Colour — ${colorway.name}`}>
      <div className="flex items-center gap-3">
        {COLORWAYS.map((c) => {
          const active = c.name === colorway.name;
          return (
            <button
              key={c.name}
              type="button"
              onClick={() => setColorway(c)}
              aria-label={c.name}
              aria-pressed={active}
              className="pointer-events-auto relative grid h-8 w-8 place-items-center rounded-full transition-transform duration-300 hover:scale-110 active:scale-95"
            >
              <span
                className="h-6 w-6 rounded-full ring-1 ring-inset ring-black/15"
                style={{ backgroundColor: c.hex }}
              />
              <span
                className={`pointer-events-none absolute h-8 w-8 rounded-full ring-1 transition-all duration-300 ${
                  active ? "ring-black/70" : "ring-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>
    </ControlGroup>
  );

  const sizes = (
    <ControlGroup label="Size">
      <div className="flex items-center gap-1">
        {SIZES.map((s) => {
          const active = s === size;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              aria-pressed={active}
              className={`pointer-events-auto h-9 w-9 font-mono text-[11px] tracking-wide transition-colors duration-200 active:scale-95 ${
                active
                  ? "bg-[#17171a] text-[#f4f4f2]"
                  : "text-[#17171a]/55 hover:text-black"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>
    </ControlGroup>
  );

  const buyBtn = (
    <button
      type="button"
      onClick={() => setNotice(true)}
      className="pointer-events-auto group relative h-12 w-full overflow-hidden bg-[#17171a] font-mono text-[11px] uppercase tracking-[0.3em] text-[#f4f4f2] active:scale-[0.99]"
    >
      <span className="absolute inset-0 translate-y-full bg-black transition-transform duration-300 ease-out group-hover:translate-y-0" />
      <span className="relative">Buy now</span>
    </button>
  );

  const promptBar = (
    <PromptBar
      prompt={prompt}
      setPrompt={setPrompt}
      busy={busy}
      error={error}
      empty={!hasDesigns}
      onSubmit={submitPrompt}
      onExample={(t) => submitPrompt(undefined, t)}
    />
  );

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#d6d2c9] text-[#1b1b1d]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(115% 105% at 50% 30%, #e7e3da 0%, #dbd7ce 48%, #c6c1b6 100%)",
        }}
      />

      {/* tee — premium fade/scale entrance */}
      <motion.div
        className="absolute inset-0"
        initial={reduced ? false : { opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: EASE }}
      >
        <Canvas
          frameloop="demand"
          dpr={[1, isMobile ? 1 : 1.6]}
          gl={{
            antialias: !isMobile,
            preserveDrawingBuffer: true,
            toneMappingExposure: 1.0,
            powerPreference: "high-performance",
          }}
          camera={{ position: [0, 0.05, 4.7], fov: 30 }}
          onPointerDown={() => setInteracted(true)}
          onWheel={() => setInteracted(true)}
        >
          <ambientLight intensity={0.65} />
          <hemisphereLight color="#ffffff" groundColor="#cfccc3" intensity={1.05} />

          <Suspense fallback={null}>
            <Tee
              colorway={colorway}
              designs={designs}
              revealNonce={revealNonce}
              testZone={testZone}
              lowPerf={isMobile}
            />
            <Environment resolution={isMobile ? 64 : 128}>
              <Lightformer intensity={0.5} position={[0, 3, 3]} scale={[14, 14, 1]} color="#ffffff" />
              <Lightformer intensity={0.3} position={[-4, 1, 2]} scale={[8, 10, 1]} color="#f4f2ec" />
            </Environment>
          </Suspense>

          <ContactShadows
            frames={1}
            position={[0, -0.92, 0]}
            opacity={0.28}
            scale={5.5}
            blur={3.2}
            far={2}
            resolution={isMobile ? 384 : 1024}
            color="#3a352c"
          />

          <CameraRig
            view={view}
            radiusScale={isMobile ? 1.46 : 1.04}
            targetY={isMobile ? -0.38 : -0.2}
          />

          <OrbitControls
            makeDefault
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            rotateSpeed={0.5}
            zoomSpeed={0.55}
            minDistance={3.6}
            maxDistance={6.5}
            minPolarAngle={Math.PI * 0.3}
            maxPolarAngle={Math.PI * 0.66}
            autoRotate={autoRotateActive}
            autoRotateSpeed={0.45}
          />

          {/* on-demand render drivers */}
          <SceneInvalidator
            colorway={colorway}
            view={view}
            designs={designs}
            testZone={testZone}
          />
          <AutoRotateDriver active={autoRotateActive} />
        </Canvas>
      </motion.div>

      {/* ───────────────────────── UI ───────────────────────── */}

      <motion.header
        {...rise(0.05)}
        className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-5 py-5 sm:px-12 sm:py-8"
      >
        <Link href="/" className="pointer-events-auto" aria-label="Z Agency — home">
          <Logo className="h-3.5 w-auto sm:h-4" />
        </Link>
        <nav className="pointer-events-auto flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.22em] text-[#17171a]/65 sm:gap-8">
          <Link href="/" className="hidden transition-colors hover:text-black sm:inline">
            Mainline
          </Link>
          <span className="flex items-center gap-2 text-[#17171a]/90">
            <span className="h-1.5 w-1.5 rounded-full bg-[#9a3b2e]" />
            New drop
          </span>
        </nav>
      </motion.header>

      {/* designs chips + size slider */}
      {hasDesigns && (
        <DesignsPanel
          designs={designs}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onRemove={removeDesign}
          selected={selectedDesign}
          onScale={setDesignScale}
          onExport={exportPrints}
          exporting={exporting}
        />
      )}

      {/* developing loader */}
      <AnimatePresence>{busy && <DevelopingLoader />}</AnimatePresence>

      {/* ── desktop: editorial corners ── */}
      <div className="hidden sm:contents">
        <motion.div
          {...rise(0.15)}
          className="pointer-events-none absolute bottom-14 left-12"
        >
          <ProductInfo />
        </motion.div>
        <motion.div
          {...rise(0.28)}
          className="pointer-events-none absolute bottom-14 right-12 flex w-[244px] flex-col items-end gap-6"
        >
          {swatches}
          {sizes}
          {buyBtn}
        </motion.div>
        <div className="pointer-events-auto absolute bottom-12 left-1/2 w-[min(540px,80vw)] -translate-x-1/2">
          {promptBar}
        </div>
      </div>

      {/* ── mobile: bottom stack — prompt on top, then controls, then name + buy.
          The tee is framed in the upper area (camera), so this sits on the plain
          page with only a whisper of gradient to seat it. ── */}
      <motion.div
        {...rise(0.15)}
        className="absolute inset-x-0 bottom-0 flex flex-col gap-3 bg-gradient-to-t from-[#d6d2c9] via-[#d6d2c9]/80 to-transparent px-4 pb-4 pt-8 sm:hidden"
      >
        {promptBar}
        <div className="flex items-end justify-between gap-3">
          {swatches}
          {sizes}
        </div>
        <div className="flex items-end justify-between gap-3">
          <ProductInfo compact />
          <div className="basis-1/2 shrink-0">{buyBtn}</div>
        </div>
      </motion.div>

      {/* ordering not live yet — Razorpay still under review */}
      <AnimatePresence>
        {notice && <OrderNotice onClose={() => setNotice(false)} />}
      </AnimatePresence>
    </main>
  );
}

function OrderNotice({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-black/35 px-6 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 14, scale: 0.98 }}
        transition={{ duration: 0.35, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[380px] border border-black/[0.08] bg-[#efece4] px-8 py-9 text-center shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#17171a]/45">
          Opening soon
        </div>
        <h2 className="mt-4 font-walsheim text-2xl font-semibold leading-tight tracking-tight text-[#17171a]">
          Ordering goes live in a few days
        </h2>
        <p className="mt-3 font-mono text-[11px] leading-relaxed tracking-wide text-[#17171a]/60">
          We&apos;re putting the final touches on checkout. Your design is saved
          on the tee — follow the story for the public drop and you&apos;ll be
          first to order.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-7 h-11 w-full bg-[#17171a] font-mono text-[11px] uppercase tracking-[0.3em] text-[#f4f4f2] transition-opacity hover:opacity-90 active:scale-[0.99]"
        >
          Got it
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ── pieces ───────────────────────────────────────────────── */

function ControlGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-2.5 sm:items-end">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ProductInfo({ compact }: { compact?: boolean }) {
  return (
    <div className={compact ? "min-w-0 text-left" : "max-w-[70%] sm:text-left"}>
      <div
        className={`font-mono uppercase tracking-[0.34em] text-[#17171a]/40 ${
          compact ? "text-[8px]" : "text-[10px] tracking-[0.4em]"
        }`}
      >
        Z — Custom Collection
      </div>
      <h1
        className={`font-walsheim font-semibold leading-none tracking-tight ${
          compact ? "mt-1.5 text-lg" : "mt-3 text-2xl sm:text-[2.2rem]"
        }`}
      >
        Signature Tee
      </h1>
      <div
        className={`flex items-center gap-2.5 font-mono uppercase tracking-[0.18em] text-[#17171a]/55 ${
          compact ? "mt-1 text-[10px]" : "mt-3 text-[11px]"
        }`}
      >
        <span className="text-[#17171a]/90">{PRICE}</span>
        {!compact && <span className="h-3 w-px bg-black/20" />}
        {!compact && <span>Heavyweight combed cotton</span>}
      </div>
    </div>
  );
}

function PromptBar({
  prompt,
  setPrompt,
  busy,
  error,
  empty,
  onSubmit,
  onExample,
}: {
  prompt: string;
  setPrompt: (v: string) => void;
  busy: boolean;
  error: string | null;
  empty: boolean;
  onSubmit: (e?: React.FormEvent) => void;
  onExample: (t: string) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="w-full">
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="err"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="mb-3 text-center font-mono text-[11px] tracking-wide text-[#9a3b2e] sm:text-center"
          >
            {error}
          </motion.div>
        ) : empty && !busy ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="mb-3 flex flex-col items-start gap-2 sm:items-center"
          >
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.28em] text-[#17171a]/45 sm:block">
              Describe anything — we print it into the cotton
            </span>
            <div className="flex flex-wrap gap-2 sm:justify-center">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => onExample(ex)}
                  className="pointer-events-auto border border-black/15 bg-white/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#17171a]/65 transition-colors hover:border-black/50 hover:text-black"
                >
                  {ex}
                </button>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div className="flex items-center gap-3 border-b border-black/25 pb-2 transition-colors focus-within:border-black/60">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={busy}
          maxLength={600}
          placeholder="Describe a graphic — e.g. tribal flames across the back"
          className="w-full bg-transparent font-mono text-[12px] tracking-wide text-[#17171a] placeholder:text-[#17171a]/35 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={busy || !prompt.trim()}
          className="shrink-0 font-mono text-[10px] uppercase tracking-[0.25em] text-[#17171a]/70 transition-colors hover:text-black disabled:opacity-30"
        >
          {busy ? "···" : "Print"}
        </button>
      </div>
    </form>
  );
}

function DesignsPanel({
  designs,
  selectedId,
  onSelect,
  onRemove,
  selected,
  onScale,
  onExport,
  exporting,
}: {
  designs: PlacedDesign[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  selected: PlacedDesign | null;
  onScale: (id: string, f: number) => void;
  onExport: () => void;
  exporting: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="pointer-events-none absolute left-1/2 top-20 flex -translate-x-1/2 flex-col items-center gap-3 sm:top-24"
    >
      <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#17171a]/40">
        Your designs
      </span>
      <div className="flex max-w-[92vw] flex-wrap justify-center gap-2">
        {designs.map((d) => {
          const sel = d.id === selectedId;
          return (
            <span
              key={d.id}
              className={`pointer-events-auto flex items-center gap-2 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] backdrop-blur-sm transition-colors ${
                sel
                  ? "border-black/70 bg-white/75 text-[#17171a]"
                  : "border-black/15 bg-white/40 text-[#17171a]/60"
              }`}
            >
              <button type="button" onClick={() => onSelect(d.id)}>
                {ZONE_LABELS[d.placement]}
              </button>
              <button
                type="button"
                onClick={() => onRemove(d.id)}
                aria-label={`Remove ${ZONE_LABELS[d.placement]} design`}
                className="text-sm leading-none text-[#17171a]/45 transition-colors hover:text-black"
              >
                ×
              </button>
            </span>
          );
        })}
      </div>
      {selected && (
        <div className="pointer-events-auto mt-0.5 flex items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#17171a]/40">
            Size
          </span>
          <input
            type="range"
            min={0.5}
            max={1.7}
            step={0.02}
            value={selected.scaleFactor ?? 1}
            onChange={(e) => onScale(selected.id, parseFloat(e.target.value))}
            aria-label="Print size"
            className="h-1 w-40 cursor-pointer appearance-none rounded-full bg-black/15 accent-[#17171a] sm:w-44"
          />
          <span className="w-9 font-mono text-[10px] tabular-nums text-[#17171a]/55">
            {Math.round((selected.scaleFactor ?? 1) * 100)}%
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={onExport}
        disabled={exporting}
        className="pointer-events-auto mt-0.5 font-mono text-[9px] uppercase tracking-[0.28em] text-[#17171a]/45 transition-colors hover:text-black disabled:opacity-40"
      >
        {exporting ? "Preparing print files…" : "↓ Export print files"}
      </button>
    </motion.div>
  );
}

const DEVELOP_PHASES = ["Generating", "Developing", "Pressing into the cotton"];

function DevelopingLoader() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setI((v) => (v + 1) % DEVELOP_PHASES.length),
      1900
    );
    return () => clearInterval(t);
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="pointer-events-none absolute left-1/2 top-[45%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4 border border-black/[0.06] bg-[#efece4]/85 px-9 py-6 shadow-[0_12px_50px_rgba(0,0,0,0.14)] backdrop-blur-md"
    >
      <div className="h-3 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="block font-mono text-[10px] uppercase tracking-[0.4em] text-[#17171a]/85"
          >
            {DEVELOP_PHASES[i]}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="relative h-px w-[190px] overflow-hidden bg-black/10">
        <motion.div
          className="absolute inset-y-0 left-0 w-14 bg-[#17171a]/75"
          animate={{ x: ["-56px", "190px"] }}
          transition={{ duration: 1.15, ease: "easeInOut", repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#17171a]/40">
      {children}
    </span>
  );
}

function Logo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/zaid-wordmark.png"
      alt="Z Agency"
      className={className}
      style={{ filter: "brightness(0)" }}
    />
  );
}
