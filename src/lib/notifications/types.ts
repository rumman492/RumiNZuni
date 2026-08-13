export type NotificationChannel = 'whatsapp' | 'email' | 'sms'
export type NotificationAudience = 'customer' | 'staff'
export type NotificationStatus = 'ready' | 'skipped' | 'sent' | 'failed'

export type OrderNotificationItem = {
  title: string
  sku: string
  size: string
  color: string
  qty: number
  price: number
}

export type OrderNotificationPayload = {
  orderNumber: string
  customerName: string
  phone: string
  email?: string
  city: string
  area: string
  address: string
  landmark?: string
  customerNotes?: string
  items: OrderNotificationItem[]
  subtotal: number
  shipping: number
  codFee: number
  total: number
  formattedTotal: string
  storeName: string
  storeWhatsapp?: string
  storePhone?: string
  storeEmail?: string
  trackUrl: string
  orderUrl: string
}

export type WhatsAppConfirmAction = {
  available: true
  url: string
  label: string
  message: string
}

export type WhatsAppConfirmUnavailable = {
  available: false
  url: null
  label: string
  message: string
}

export type NotificationResult = {
  channel: NotificationChannel
  audience: NotificationAudience
  provider: string
  status: NotificationStatus
  to?: string
  error?: string
  at: string
}

export type OutboundMessage = {
  channel: NotificationChannel
  audience: NotificationAudience
  to: string
  subject?: string
  text: string
  payload: OrderNotificationPayload
}
