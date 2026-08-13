export { getNotificationConfig } from '@/lib/notifications/config'
export { buildOrderNotificationPayload, notifyOrderPlaced } from '@/lib/notifications/dispatch'
export { buildWhatsAppConfirmAction } from '@/lib/notifications/whatsapp-action'
export type {
  NotificationResult,
  OrderNotificationPayload,
  WhatsAppConfirmAction,
  WhatsAppConfirmUnavailable,
} from '@/lib/notifications/types'
