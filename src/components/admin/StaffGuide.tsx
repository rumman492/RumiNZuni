import type { ReactNode } from 'react'
import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import Link from 'next/link'

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{title}</h2>
      <div style={{ lineHeight: 1.55, maxWidth: '46rem' }}>{children}</div>
    </section>
  )
}

export default function StaffGuide({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, locale, permissions, visibleEntities } = initPageResult
  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      req={req}
      searchParams={searchParams}
      user={req.user || undefined}
      visibleEntities={visibleEntities}
    >
      <Gutter>
        <h1 style={{ marginTop: '1.5rem' }}>Staff guide — run the shop without a developer</h1>
        <p style={{ maxWidth: '46rem', color: 'var(--theme-elevation-600)' }}>
          Everything day-to-day lives in this admin. Hire staff, give them a Staff login, and use this page as
          training. You should not need Cursor for new products, prices, photos, categories, pages, or COD
          orders.
        </p>

        <Block title="1. Daily COD orders">
          <ol>
            <li>
              Open <Link href="/admin/collections/orders">Orders</Link>. New checkouts arrive as Pending.
            </li>
            <li>Confirm the order on WhatsApp, then set status to Confirmed.</li>
            <li>Packed → Shipped (add courier + tracking) → Out for delivery → Delivered.</li>
            <li>When the rider is paid, mark payment Collected. Delivered unpaid orders are marked collected automatically.</li>
            <li>If it fails: Cancelled, Refused at door, Failed delivery, or Returned.</li>
          </ol>
        </Block>

        <Block title="2. Add a kids product">
          <ol>
            <li>
              <Link href="/admin/collections/products/create">Add product</Link>. Upload photos (Media, 5 MB or smaller).
            </li>
            <li>Department: Kids Wear, Accessories, or Kids Footwear. Category: Boys, Girls, Newborn, Accessories, or Footwear.</li>
            <li>Clothing: set Boys or Girls and an age group. Leave gender empty for extras.</li>
            <li>Variants: size code from Sizes (e.g. 3y), colour, PKR price, optional sale price, stock, SKU.</li>
            <li>Save as Draft to preview, then Publish. Tick Featured to pin it on the homepage.</li>
          </ol>
        </Block>

        <Block title="3. Add a Women’s product">
          <p>Do not set kids age groups or Boys/Girls on Women’s items.</p>
          <ul>
            <li>
              <strong>Handbags:</strong> Department Women’s Handbags + category Handbags. Bag type, colour, material. Variant size{' '}
              <code>onesize</code>, colour = bag colour.
            </li>
            <li>
              <strong>Makeup:</strong> Department Women’s Beauty + category Makeup (slug stays beauty). Product type, brand, shade.
              Variant colour = shade name; size <code>onesize</code>; optional shade code.
            </li>
            <li>
              <strong>Skincare:</strong> Department Women’s Skincare + category Skincare. Product type, skin type, volume. Size can be{' '}
              <code>50ml</code> or <code>onesize</code>.
            </li>
            <li>
              <strong>Perfumes:</strong> Department Women’s Perfumes + category Perfumes. Fragrance type/family. Variant size = volume
              (50ml, 100ml). Colour can be None.
            </li>
          </ul>
          <p>
            Type brand, bag type, skin type, and fragrance family using the same wording as{' '}
            <Link href="/admin/collections/catalog-options">Catalog options</Link> so shop filters group. Add new brands and types
            there — no code change.
          </p>
        </Block>

        <Block title="4. Categories, Hair Care, navigation">
          <ul>
            <li>
              <Link href="/admin/collections/categories">Categories</Link>: tick Active to show Hair Care, Body Care, or Beauty Tools
              on the shop. Leave Active off to hide them.
            </li>
            <li>
              New subcategory: create it, pick a Women’s department, set parent Beauty &amp; Personal Care if needed, tick Active.
              URL will be /shop/your-slug.
            </li>
            <li>
              Header/footer: <Link href="/admin/globals/site-settings">Store settings → Navigation</Link>. Empty keeps the built-in
              menu (Kids Wear and Women’s open as dropdowns).
            </li>
            <li>
              Homepage hero, collections, featured products: Store settings → Homepage.
            </li>
          </ul>
        </Block>

        <Block title="5. Shipping, policies, contact">
          <ul>
            <li>Store settings → Shipping &amp; COD: free-shipping threshold, default fee, city rates, WhatsApp number.</li>
            <li>
              <Link href="/admin/collections/pages">Pages</Link>: slugs <code>shipping</code>, <code>returns</code>,{' '}
              <code>contact</code> replace those storefront pages.
            </li>
            <li>
              <Link href="/admin/collections/couriers">Couriers</Link>: names you pick on orders (TCS, Leopards, rider). Tracking is
              typed on the order.
            </li>
          </ul>
        </Block>

        <Block title="6. Staff accounts">
          <p>
            Owner only: <Link href="/admin/collections/users">Users</Link> → create Staff with a unique 12+ character password.
            Do not share the owner login. Staff can run products, orders, and settings; only Admin can add users or change roles.
          </p>
        </Block>

        <Block title="7. When you still need a developer">
          <ul>
            <li>New payment methods (cards, wallets) — the shop is COD only on purpose.</li>
            <li>Connecting a courier API (auto booking) instead of typing tracking by hand.</li>
            <li>A brand-new kind of shop filter that does not exist yet (not just a new brand, bag type, or fragrance family).</li>
            <li>Server, domain, or email/SMS provider setup.</li>
          </ul>
          <p>Do not invent product claims. Put real ingredients, warnings, and prices on each product.</p>
        </Block>
      </Gutter>
    </DefaultTemplate>
  )
}
