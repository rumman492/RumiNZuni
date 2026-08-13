# RumiNZuni

Kids wear store for **Pakistan**, **cash on delivery only**. Shoppers pay the rider in PKR. No card/Stripe unless the owner explicitly asks.

## Stack

- Next.js 15 App Router + TypeScript + Tailwind CSS v4
- Payload CMS 3 (admin at `/admin`)
- Database: PostgreSQL only (`DATABASE_URL=postgresql://...`, see `docker-compose.yml`)

## Layout

- Storefront: `src/app/(storefront)/`
- Admin + Payload API: `src/app/(payload)/`
- Collections: `src/collections/` (Users, Media, Categories, Products, Orders, Couriers, Pages)
- Store settings global: `src/globals/SiteSettings.ts`
- COD checkout (server-verified prices/stock): `src/endpoints/checkout.ts`
- Order notifications: `src/lib/notifications/` (WhatsApp confirm action + env-configured email/SMS providers)
- Courier/shipment on orders: `src/lib/shipping.ts` (manual now; registerCourierAdapter() for future APIs)
- Media storage: local disk by default; S3-compatible object storage via `MEDIA_STORAGE=s3` (`src/lib/storage.ts`). Keep `/api/media/file/:filename` URLs.
- Cart is client-side (`localStorage`), guest checkout

## Commands

```bash
npm install
npm run dev
npm run seed
```

- Store: http://localhost:3000
- Admin: http://localhost:3000/admin
- Seeded admin: `admin@ruminzuni.com` / `ChangeMeNow1` (change after first login)

Copy `.env.example` to `.env`. Never commit `.env`.

Live site uses **PostgreSQL** + Docker on a VPS (`ruminzuni.com`). Follow `DEPLOY.md`. Do not use Vercel for this app.

## Product and order rules

- Currency is **PKR**. Format with `formatPkr()` from `src/lib/pakistan.ts`.
- Phone must be Pakistani mobile (`03XXXXXXXXX`). Cities come from `PAKISTAN_CITIES`.
- Product variants have size, color, SKU, price, stock.
- Checkout must trust **server** prices and stock, never the client.
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
