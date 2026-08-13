import { formatPkr } from '@/lib/pakistan'
import type { OrderNotificationPayload } from '@/lib/notifications/types'

function itemLines(payload: OrderNotificationPayload) {
  return payload.items
    .map((item) => `• ${item.title} (${item.size} / ${item.color}) × ${item.qty} — ${formatPkr(item.price * item.qty)}`)
    .join('\n')
}

export function customerWhatsAppMessage(payload: OrderNotificationPayload) {
  return [
    `Assalamualaikum, I just placed a cash-on-delivery order with ${payload.storeName}.`,
    '',
    `Order: ${payload.orderNumber}`,
    `Name: ${payload.customerName}`,
    `Phone: ${payload.phone}`,
    `City: ${payload.city}`,
    `Total: ${payload.formattedTotal}`,
    '',
    itemLines(payload),
    '',
    'Please confirm this order. I will pay the rider in PKR when it arrives.',
  ].join('\n')
}

export function staffWhatsAppMessage(payload: OrderNotificationPayload) {
  return [
    `New COD order ${payload.orderNumber}`,
    `${payload.customerName} · ${payload.phone}`,
    `${payload.city}, ${payload.area}`,
    payload.address,
    `Total ${payload.formattedTotal} (unpaid, collect on delivery)`,
    itemLines(payload),
    payload.orderUrl,
  ].join('\n')
}

export function customerEmailSubject(payload: OrderNotificationPayload) {
  return `${payload.storeName} order ${payload.orderNumber} — cash on delivery`
}

export function customerEmailText(payload: OrderNotificationPayload) {
  return [
    `Thank you, ${payload.customerName}.`,
    '',
    `Your cash-on-delivery order ${payload.orderNumber} is pending confirmation.`,
    `Pay ${payload.formattedTotal} to the rider in ${payload.city}. No card is needed.`,
    '',
    itemLines(payload),
    '',
    `Subtotal: ${formatPkr(payload.subtotal)}`,
    `Shipping: ${payload.shipping === 0 ? 'Free' : formatPkr(payload.shipping)}`,
    payload.codFee > 0 ? `COD fee: ${formatPkr(payload.codFee)}` : null,
    `Total: ${payload.formattedTotal}`,
    '',
    `Track your order: ${payload.trackUrl}`,
    '',
    `WhatsApp us if you need to confirm size or address: ${payload.storeWhatsapp || payload.storePhone || payload.storeEmail || payload.trackUrl}`,
  ]
    .filter(Boolean)
    .join('\n')
}

export function staffEmailSubject(payload: OrderNotificationPayload) {
  return `New COD order ${payload.orderNumber} — ${payload.formattedTotal}`
}

export function staffEmailText(payload: OrderNotificationPayload) {
  return [
    `A new cash-on-delivery order was placed.`,
    '',
    `Order: ${payload.orderNumber}`,
    `Customer: ${payload.customerName}`,
    `Phone: ${payload.phone}`,
    payload.email ? `Email: ${payload.email}` : null,
    `Address: ${payload.address}, ${payload.area}, ${payload.city}`,
    payload.landmark ? `Landmark: ${payload.landmark}` : null,
    payload.customerNotes ? `Notes: ${payload.customerNotes}` : null,
    '',
    itemLines(payload),
    '',
    `Total: ${payload.formattedTotal} (unpaid — collect on delivery)`,
    `Admin: ${payload.orderUrl}`,
  ]
    .filter(Boolean)
    .join('\n')
}

export function customerSmsText(payload: OrderNotificationPayload) {
  return `${payload.storeName}: COD order ${payload.orderNumber} received. Pay ${payload.formattedTotal} to the rider in ${payload.city}. Track: ${payload.trackUrl}`
}

export function staffSmsText(payload: OrderNotificationPayload) {
  return `New COD ${payload.orderNumber} ${payload.formattedTotal} from ${payload.customerName} (${payload.phone}) in ${payload.city}.`
}
