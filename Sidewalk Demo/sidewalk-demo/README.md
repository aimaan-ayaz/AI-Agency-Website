# Sidewalk — QR Dine-in Ordering Demo

A phone-first demo of QR table ordering for Sidewalk café. Everything is simulated on the
frontend — **no backend, no real payments, no accounts**. Built with Next.js (App Router),
TypeScript, Tailwind CSS and Framer Motion.

## Run it

```bash
npm install
npm run dev
```

Open **http://localhost:3000/sidewalkdemo** on a phone-sized viewport
(the app serves under `/sidewalkdemo` — see "Changing the base path" below).

Simulate a table's QR code with the query param: `http://localhost:3000/sidewalkdemo?table=12`
(no param → defaults to Table 4).

Production build check: `npm run build`.

## The flow

Menu → add items → sticky cart bar → cart sheet → simulated UPI/card payment →
processing → success tick → confirmation with order number, table and ETA.

## Correcting the menu

Everything is in **`data/menu.ts`** — one big, readable array of categories and items,
extracted from the official menu PDF. Each item has `name`, `description`, `price`,
optional `icedPrice` (when the menu lists hot/iced prices — the app then asks Hot or Iced),
and `tags` (`veg` / `nonveg` / `egg` / `spicy` / `special`). Edit values in place; nothing
else needs to change.

## Changing branding

Two clearly-marked spots:

- **`data/brand.ts`** — name, tagline, default table, currency, ETA, fine print.
- **`app/globals.css`** — the `@theme` block at the top holds every color and the two fonts.
- **Logo** — swap `public/logo.png`.

Item tiles show hand-drawn-style line icons (matching the menu's illustration style),
defined in `components/FoodIcon.tsx`. Items are matched to icons by keyword rules with a
per-category fallback, so edited/new items get an icon automatically; adjust the `RULES`
list there to change a match. To use real photos later, replace `<FoodIcon />` in
`ItemCard.tsx` with an `<Image />`.

## Changing the base path

Open **`next.config.ts`** — the `BASE_PATH` constant at the top is the only thing to touch:

- `"/sidewalkdemo"` (current) → serves at `yourdomain.com/sidewalkdemo`
- `""` → serves at the domain root (e.g. a `sidewalk.` subdomain)

Rebuild after changing it (`npm run build`) — the value is baked into the bundle.

## Deploying / routing to zaid.agency

The app is fully self-contained (no hardcoded URLs, self-hosted fonts, no external images),
so it can sit anywhere:

- **As zaid.agency/sidewalkdemo** — keep `BASE_PATH = "/sidewalkdemo"`, deploy this app
  (e.g. Vercel), then route the path from the main site to it (Vercel rewrites or your
  reverse proxy: proxy `/sidewalkdemo/*` to this deployment).
- **As a subdomain** (e.g. sidewalk.zaid.agency) — set `BASE_PATH = ""`, rebuild, deploy,
  and point the subdomain's DNS at the deployment.

Print QR codes that encode `https://…/sidewalkdemo?table=<n>` per table.
