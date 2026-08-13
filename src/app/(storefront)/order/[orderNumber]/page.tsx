import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { buildOrderNotificationPayload, buildWhatsAppConfirmAction } from '@/lib/notifications'
import { verifyOrderAccessToken } from '@/lib/order-access'
import { formatPkr } from '@/lib/pakistan'
import { ORDER_NUMBER_PATTERN } from '@/lib/security'

function notFoundCard() {
  return (
    <div>
      <h1 className="display text-4xl">Order not found</h1>
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

  if (!ORDER_NUMBER_PATTERN.test(orderNumber) || !verifyOrderAccessToken(orderNumber, accessToken)) {
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
      <p className="text-center text-sm font-bold uppercase tracking-wide text-sage">Order placed</p>
      <h1 className="display mt-3 text-center text-4xl">Thank you, {order.customerName}</h1>
      <p className="mt-4 text-center text-ink-soft">
        Your cash on delivery order <span className="font-bold text-ink">{order.orderNumber}</span> is pending
        confirmation. Pay {formatPkr(Number(order.total))} to the rider in {order.city}.
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
          <span>Total · COD</span>
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
        <Link href="/track" className="rounded-full border border-ink/10 px-6 py-3 text-center text-sm font-bold">
          Track later
        </Link>
      </div>
      {whatsapp.available ? (
        <p className="mt-4 text-center text-sm text-ink-soft">
          Opens WhatsApp with your order number so we can confirm size, address, and dispatch.
        </p>
      ) : (
        <p className="mt-4 text-center text-sm text-ink-soft">We will confirm this order by phone before dispatch.</p>
      )}
    </div>
  )
}
