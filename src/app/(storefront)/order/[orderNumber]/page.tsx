import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { formatPkr, toWhatsAppNumber } from '@/lib/pakistan'

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const { orderNumber } = await params
  const payload = await getPayloadClient()
  const [result, settings] = await Promise.all([
    payload.find({
      collection: 'orders',
      overrideAccess: true,
      where: { orderNumber: { equals: orderNumber } },
      limit: 1,
    }),
    payload.findGlobal({ slug: 'site-settings' }),
  ])
  const order = result.docs[0]

  if (!order) {
    return (
      <div>
        <h1 className="display text-4xl">Order not found</h1>
        <Link href="/track" className="mt-4 inline-block font-bold text-coral">
          Track an order
        </Link>
      </div>
    )
  }

  const wa = toWhatsAppNumber(String(settings.whatsapp || '03001234567'))
  const message = encodeURIComponent(
    `Assalamualaikum, I just placed COD order ${order.orderNumber} for ${formatPkr(Number(order.total))}.`,
  )

  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-bold uppercase tracking-wide text-sage">Order placed</p>
      <h1 className="display mt-3 text-4xl">Thank you, {order.customerName}</h1>
      <p className="mt-4 text-ink-soft">
        Your cash on delivery order <span className="font-bold text-ink">{order.orderNumber}</span> is pending
        confirmation. Pay {formatPkr(Number(order.total))} to the rider in {order.city}.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a
          href={`https://wa.me/${wa}?text=${message}`}
          className="rounded-full bg-sage px-6 py-3 text-sm font-bold text-white"
        >
          WhatsApp us this order
        </a>
        <Link href="/track" className="rounded-full border border-ink/10 px-6 py-3 text-sm font-bold">
          Track later
        </Link>
      </div>
    </div>
  )
}
