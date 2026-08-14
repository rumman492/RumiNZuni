import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { buildOrderNotificationPayload, buildWhatsAppConfirmAction } from '@/lib/notifications'
import { canViewOrderConfirmation } from '@/lib/checkout'
import { formatPkr } from '@/lib/pakistan'
import { pageMeta } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}): Promise<Metadata> {
  const { orderNumber } = await params
  return pageMeta({
    title: `Order ${orderNumber}`,
    description: 'Your Rumi & Zuni order was received. We are getting it ready for cash-on-delivery.',
    path: `/order/${orderNumber}`,
    index: false,
    follow: false,
  })
}

function notFoundCard() {
  return (
    <div>
      <h1 className="display text-4xl">We could not find that order</h1>
      <Link href="/track" className="mt-4 inline-block font-bold text-coral">
        Track an order
      </Link>
    </div>
  )
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>
  searchParams: Promise<{ t?: string | string[] }>
}) {
  const { orderNumber } = await params
  const token = (await searchParams).t
  const accessToken = Array.isArray(token) ? token[0] : token

  if (!canViewOrderConfirmation(orderNumber, accessToken)) {
    return notFoundCard()
  }

  const payload = await getPayloadClient()
  const [result, settings] = await Promise.all([
    payload.find({
      collection: 'orders',
      overrideAccess: true,
      depth: 0,
      where: { orderNumber: { equals: orderNumber } },
      limit: 1,
    }),
    payload.findGlobal({ slug: 'site-settings' }),
  ])
  const order = result.docs[0]

  if (!order) {
    return notFoundCard()
  }

  const notification = buildOrderNotificationPayload(order, settings)
  const whatsapp = order.whatsappConfirmUrl
    ? {
        available: true as const,
        url: order.whatsappConfirmUrl,
        label: 'Confirm this order on WhatsApp',
      }
    : buildWhatsAppConfirmAction(notification)

  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] bg-white p-8 shadow-sm">
      <p className="text-center text-sm font-bold uppercase tracking-wide text-sage">Order received</p>
      <h1 className="display mt-3 text-center text-4xl">Thank you, {order.customerName}</h1>
      <p className="mt-4 text-center text-ink-soft">
        Your order is confirmed in our shop. We are getting it ready — a little moment of joy, on its way.
      </p>
      <p className="mt-3 text-center text-sm text-ink-soft">
        Order <span className="font-bold text-ink">{order.orderNumber}</span> · Payment: Cash on Delivery · Total{' '}
        {formatPkr(Number(order.total))} · {order.city}
      </p>

      <ul className="mt-8 space-y-2 rounded-2xl bg-sand/60 p-5 text-sm">
        {(order.items || []).map((item) => (
          <li key={`${item.sku}-${item.id || item.title}`} className="flex justify-between gap-3">
            <span>
              {item.title} · {item.size} · {item.color} × {item.qty}
            </span>
            <span>{formatPkr(Number(item.price) * Number(item.qty))}</span>
          </li>
        ))}
        <li className="flex justify-between border-t border-ink/10 pt-2 font-bold">
          <span>Total · Cash on Delivery</span>
          <span>{formatPkr(Number(order.total))}</span>
        </li>
      </ul>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {whatsapp.available ? (
          <a
            href={whatsapp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-sage px-6 py-3 text-center text-sm font-bold text-white"
          >
            {whatsapp.label}
          </a>
        ) : null}
        <Link href="/contact" className="rounded-full border border-ink/10 px-6 py-3 text-center text-sm font-bold">
          Need to make a change? Contact us
        </Link>
        <Link href="/track" className="rounded-full border border-ink/10 px-6 py-3 text-center text-sm font-bold">
          Track later
        </Link>
      </div>
      {whatsapp.available ? (
        <p className="mt-4 text-center text-sm text-ink-soft">
          Opens WhatsApp with your order number so we can confirm size, address, and dispatch.
        </p>
      ) : (
        <p className="mt-4 text-center text-sm text-ink-soft">We will confirm this order by phone before dispatch. Need to make a change? Contact us.</p>
      )}
    </div>
  )
}
