# Z AI Fashion Studio

3D t-shirt customiser at /fashion. User types a prompt → AI generates a graphic → it renders printed into the fabric of a rotatable 3D tee (the whole tee materialises bottom-up with a pixel dissolve on each generate). Full build plan is in SPEC.md.

# Stack
- Next.js (App Router) + TypeScript + Tailwind
- React Three Fiber + @react-three/drei (Decal, Environment, ContactShadows, OrbitControls, useGLTF)
- Framer Motion
- Google Gemini 2.5 Flash (design director, JSON mode) — free Google AI Studio (GEMINI_API_KEY)
- Cloudflare Workers AI FLUX.1 [schnell] for graphics (free, commercial-clean); transparency via a sharp grey-key (server-side cutout of FLUX's flat-grey field — host-portable, no ML runtime)

# Commands
- Dev: npm run dev
- Build: npm run build
- Lint: npm run lint
- Typecheck: npm run typecheck   # run this after a series of changes

# Hard rules
- IMPORTANT: the printed graphic MUST look woven into the fabric (matte, follows the weave + folds), never a glossy sticker. Use a PBR material with a fabric normalMap + roughnessMap + high roughness; apply the design as a Decal that inherits that material.
- All AI calls go through Next.js API routes. NEVER put API keys in client code.
- Image model is Cloudflare Workers AI FLUX.1 [schnell] (free), called server-side from /api/generate. FLUX has no transparent output, so the design-director requests a flat light-grey background and the route keys it out with sharp (sample corner colour → make near-background pixels transparent) → transparent PNG (data URL), then trims + squares it. No ML cutout / onnxruntime (doesn't survive typical Node hosts). OpenAI/gpt-image-1 removed.
- Gemini's design-director responses are JSON only (responseMimeType: application/json); parse them defensively on the server. Fully free: Gemini (brain) + Cloudflare FLUX (image) — no OpenAI, no Anthropic in the fashion studio.
- NEVER use generic AI aesthetics (Inter/Roboto/Arial/system fonts, purple gradients, cookie-cutter layouts). Use distinctive fonts, a cohesive theme, and micro-interactions.
- Keep it simple — no unnecessary "production-grade" complexity. Simplest approach that looks premium.
- Must look and perform well on mobile (cap renderer DPR, keep the model light, no heavy post-processing on phones).

# Workflow
- Build phase by phase per SPEC.md. Do not start a later phase until the current one's Verify gate passes.
- Explore and plan before editing; don't change files until the plan is approved.

# Scope
- v1 = Phases 1–3 in SPEC.md. Payment, print export, accounts, and persistence are OUT OF SCOPE for now. If one seems needed, flag it instead of building it.
