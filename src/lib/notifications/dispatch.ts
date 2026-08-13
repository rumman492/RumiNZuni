import type { Payload } from 'payload'
import { formatPkr, isValidPkPhone, normalizePkPhone } from '@/lib/pakistan'
import { siteOrigin } from '@/lib/site'
import { getNotificationConfig } from '@/lib/notifications/config'
import { sendOutboundMessage } from '@/lib/notifications/providers'
import {
  customerEmailSubject,
  customerEmailText,
  customerSmsText,
  customerWhatsAppMessage,
  staffEmailSubject,
  staffEmailText,
  staffSmsText,
  staffWhatsAppMessage,
} from '@/lib/notifications/templates'
import type {
  NotificationResult,
  OrderNotificationItem,
  OrderNotificationPayload,
  OutboundMessage,
  WhatsAppConfirmAction,
  WhatsAppConfirmUnavailable,
} from '@/lib/notifications/types'
import { buildWhatsAppConfirmAction } from '@/lib/notifications/whatsapp-action'

type Logger = Pick<Payload['logger'], 'info' | 'error'>

type OrderLike = {
  id: string | number
  orderNumber: string
  customerName: string
  phone: string
  email?: string | null
  city: string
  area: string
  address: string
  landmark?: string | null
  customerNotes?: string | null
  items?: Array<{
    title: string
    sku: string
    size: string
    color: string
    qty: number
    price: number
  }> | null
  subtotal: number
  shipping: number
  codFee?: number | null
  total: number
}

type SettingsLike = {
  storeName?: string | null
  whatsapp?: string | null
  phone?: string | null
  email?: string | null
}

function serverUrl() {
  return siteOrigin()
}

function optionalPhone(value?: string | null) {
  if (!value) return undefined
  const phone = normalizePkPhone(value)
  return isValidPkPhone(phone) ? phone : undefined
}

export function buildOrderNotificationPayload(order: OrderLike, settings: SettingsLike): OrderNotificationPayload {
  const origin = serverUrl()
  const items: OrderNotificationItem[] = (order.items || []).map((item) => ({
    title: item.title,
    sku: item.sku,
    size: item.size,
    color: item.color,
    qty: item.qty,
    price: item.price,
  }))

  return {
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    phone: normalizePkPhone(order.phone),
    email: order.email?.trim() || undefined,
    city: order.city,
    area: order.area,
    address: order.address,
    landmark: order.landmark?.trim() || undefined,
    customerNotes: order.customerNotes?.trim() || undefined,
    items,
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    codFee: Number(order.codFee || 0),
    total: Number(order.total),
    formattedTotal: formatPkr(Number(order.total)),
    storeName: settings.storeName?.trim() || 'Rumi & Zuni',
    storeWhatsapp: optionalPhone(settings.whatsapp),
    storePhone: optionalPhone(settings.phone),
    storeEmail: settings.email?.trim() || undefined,
    trackUrl: `${origin}/track`,
    orderUrl: `${origin}/admin/collections/orders/${order.id}`,
  }
}

function buildOutboundJobs(
  payload: OrderNotificationPayload,
  config: ReturnType<typeof getNotificationConfig>,
): OutboundMessage[] {
  const jobs: OutboundMessage[] = []
  const staffWhatsapp = optionalPhone(config.staffWhatsapp) || payload.storeWhatsapp
  const staffEmail = config.staffEmail || payload.storeEmail
  const staffPhone = optionalPhone(config.staffPhone) || payload.storePhone

  if (config.whatsapp.provider !== 'none' && staffWhatsapp) {
    jobs.push({
      channel: 'whatsapp',
      audience: 'staff',
      to: staffWhatsapp,
      text: staffWhatsAppMessage(payload),
      payload,
    })
  }

  if (config.whatsapp.provider !== 'none' && config.whatsapp.customerTemplate && payload.phone) {
    jobs.push({
      channel: 'whatsapp',
      audience: 'customer',
      to: payload.phone,
      text: customerWhatsAppMessage(payload),
      payload,
    })
  }

  if (config.email.provider !== 'none' && staffEmail) {
    jobs.push({
      channel: 'email',
      audience: 'staff',
      to: staffEmail,
      subject: staffEmailSubject(payload),
      text: staffEmailText(payload),
      payload,
    })
  }

  if (config.email.provider !== 'none' && payload.email) {
    jobs.push({
      channel: 'email',
      audience: 'customer',
      to: payload.email,
      subject: customerEmailSubject(payload),
      text: customerEmailText(payload),
      payload,
    })
  }

  if (config.sms.provider !== 'none' && staffPhone) {
    jobs.push({
      channel: 'sms',
      audience: 'staff',
      to: staffPhone,
      text: staffSmsText(payload),
      payload,
    })
  }

  if (config.sms.provider !== 'none' && payload.phone) {
    jobs.push({
      channel: 'sms',
      audience: 'customer',
      to: payload.phone,
      text: customerSmsText(payload),
      payload,
    })
  }

  return jobs
}

export async function notifyOrderPlaced(args: {
  payload: Payload
  order: OrderLike
  settings: SettingsLike
  logger?: Logger
}): Promise<{
  whatsapp: WhatsAppConfirmAction | WhatsAppConfirmUnavailable
  results: NotificationResult[]
}> {
  const config = getNotificationConfig()
  const event = buildOrderNotificationPayload(args.order, args.settings)
  const whatsapp = buildWhatsAppConfirmAction(event)
  const at = new Date().toISOString()

  const results: NotificationResult[] = [
    {
      channel: 'whatsapp',
      audience: 'customer',
      provider: 'wa.me',
      status: whatsapp.available ? 'ready' : 'skipped',
      to: event.storeWhatsapp,
      error: whatsapp.available ? undefined : whatsapp.message,
      at,
    },
  ]

  if (config.outboundEnabled) {
    const jobs = buildOutboundJobs(event, config)
    const outbound = await Promise.all(jobs.map((job) => sendOutboundMessage(config, job, args.logger)))
    results.push(...outbound)
  }

  try {
    await args.payload.update({
      collection: 'orders',
      id: args.order.id,
      overrideAccess: true,
      data: {
        whatsappConfirmUrl: whatsapp.available ? whatsapp.url : null,
        notifications: results.map((result) => ({
          channel: result.channel,
          audience: result.audience,
          provider: result.provider,
          status: result.status,
          to: result.to,
          error: result.error,
          at: result.at,
        })),
      },
    })
  } catch (error) {
    args.logger?.error({
      msg: 'Could not store order notification log',
      orderNumber: args.order.orderNumber,
      err: error instanceof Error ? error.message : 'unknown',
    })
  }

  return { whatsapp, results }
}
