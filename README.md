# RumiNZuni

Kids wear store for Pakistan. Shoppers pay **cash on delivery**. Staff manage catalog, stock, and orders from the Payload CMS admin panel.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Payload CMS 3 (admin at `/admin`)
- PostgreSQL for catalog, orders, and admin users
- COD checkout with PK phone, city, and address fields

## Run locally

Node.js 20+ is required. If `node` is not on your PATH, a portable copy lives at `%USERPROFILE%\source\tools\node`.

1. Copy `.env.example` to `.env` (already done for this repo).
2. Install dependencies and start the app:

```bash
npm install
npm run dev
```

On this Windows machine you can also run `.\dev.ps1` from the project folder.

3. In another terminal, seed sample products and an admin user:

```bash
npm run seed
```

Open:

- Store: [http://localhost:3000](http://localhost:3000)
- Admin CMS: [http://localhost:3000/admin](http://localhost:3000/admin)
  - Email: `admin@ruminzuni.com`
  - Password: `ChangeMeNow1` (change this after first login)

## Go live

Live site = **PostgreSQL** on a VPS (not Vercel).

Full steps for `ruminzuni.com`: see [DEPLOY.md](./DEPLOY.md).

## How COD works

1. Customer adds sizes/colors to cart and checks out with name, mobile, city, area, and address.
2. Prices and stock are verified on the server. Payment method is always cash on delivery.
3. Order appears in **Admin → Orders** as `Pending` / `Unpaid`.
4. Staff confirm on WhatsApp, then move status: Confirmed → Packed → Shipped → Delivered.
5. When the rider collects cash, mark **Payment status: Collected**.

## What you can edit in admin

- Products, variants, stock, sale prices
- Categories
- Orders and COD collection status
- Store settings (WhatsApp number, shipping by city, free-delivery threshold, homepage copy)
- Pages and media
