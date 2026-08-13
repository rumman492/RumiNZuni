# RumiNZuni

Kids wear store for **Pakistan**, **cash on delivery only**. Shoppers pay the rider in PKR. No card/Stripe unless the owner explicitly asks.

## Stack

- Next.js 15 App Router + TypeScript + Tailwind CSS v4
- Payload CMS 3 (admin at `/admin`)
- Database: PostgreSQL only (`DATABASE_URL=postgresql://...`, see `docker-compose.yml`)
- Production schema: `src/migrations/` via `prodMigrations` (Payload does not drizzle-push when `NODE_ENV=production`)

## Layout

- Storefront: `src/app/(storefront)/`
- Admin + Payload API: `src/app/(payload)/`
- Admin dashboard stats: `src/components/admin/DashboardStats.tsx` (`beforeDashboard` — today's COD orders/sales, pipeline counts, low stock)
- Collections: `src/collections/` (Users, Media, Categories, Products, Tags, Size guides, Orders, Couriers, Pages)
- Store settings global: `src/globals/SiteSettings.ts` (Homepage tab drives hero, collections, featured products, promos, and story copy)
- COD checkout (server-verified prices/stock): `src/endpoints/checkout.ts`
- Order notifications: `src/lib/notifications/` (WhatsApp confirm action + env-configured email/SMS providers)
- Courier/shipment on orders: `src/lib/shipping.ts` (manual now; registerCourierAdapter() for future APIs)
- Media storage: local disk by default; S3-compatible object storage via `MEDIA_STORAGE=s3` (`src/lib/storage.ts`). Keep `/api/media/file/:filename` URLs.
- Cart is client-side (`localStorage`), guest checkout
- SEO: `src/lib/site.ts` (canonical origin), `src/lib/seo.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`
- Tests: `tests/` (Vitest). `npm test` runs cart, phone, shipping/COD, checkout, stock, orders, tracking, access, and the COD purchase flow.

## Commands

```bash
npm install
npm run dev
npm run seed
npm test
```

- Store: http://localhost:3000
- Admin: http://localhost:3000/admin — create the first user there with a unique 12+ character password. Do not document or commit admin passwords.

Copy `.env.example` to `.env` and set `PAYLOAD_SECRET` (`openssl rand -hex 32`). Never commit `.env`. `npm run seed` is local-only and will not create an admin unless `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` are set.

Live site uses **PostgreSQL** + Docker on a VPS (`ruminzuni.com`). Follow `DEPLOY.md`. Do not use Vercel for this app.

## Product and order rules

- Currency is **PKR**. Format with `formatPkr()` from `src/lib/pakistan.ts`.
- Phone must be Pakistani mobile (`03XXXXXXXXX`). Cities come from `PAKISTAN_CITIES`.
- Product variants have size, color, SKU, price, stock.
- Optional catalog fields: tags (`tags`), size guides (`size-guides`), material, care, SEO title/description, sortPriority (higher first), related products. Leave them empty on older products.
- Shop search/filters use URL query params (`q`, `category`, `gender`, `age`, `size`, `color`, `min`, `max`, `inStock`, `sort`, `page`) so results are shareable. Pretty paths like `/shop/boys` stay indexed; extra facets are `noindex,follow`.
- Canonical domain is `NEXT_PUBLIC_SERVER_URL` (`https://ruminzuni.com` in production). Sitemap `/sitemap.xml`, robots `/robots.txt`. Cart, checkout, track, order, admin, and API are noindex.
- Checkout must trust **server** prices and stock, never the client.
- Public APIs (`/api/checkout`, `/api/track-order`) validate input, rate-limit by IP, check same-origin, and return generic errors — never database/stack traces. Confirmation pages require a signed `t` token.
- Payment method is always `cod`. Order flow: Pending → Confirmed → Packed → Shipped → Out for delivery → Delivered.
- Exceptions: Cancelled, Refused at door, Failed delivery, Returned. Status history is recorded automatically.
- Mark cash collected with `paymentStatus: collected` (Delivered unpaid orders are marked collected automatically).
- WhatsApp number lives in Store settings; use it for order confirmation links.

## How to work in this repo

- Prefer small, focused changes that match existing Payload collections and storefront components.
- After Payload admin component changes, run `npm run generate:importmap`.
- After collection/field changes, run `npm run generate:types`.
- Keep the storefront English for now unless asked for Urdu.
- Do not add other payment gateways, subscriptions, or a second CMS.
