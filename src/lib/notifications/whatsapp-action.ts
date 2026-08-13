import { isValidPkPhone, toWhatsAppNumber } from '@/lib/pakistan'
import { customerWhatsAppMessage } from '@/lib/notifications/templates'
import type { OrderNotificationPayload, WhatsAppConfirmAction, WhatsAppConfirmUnavailable } from '@/lib/notifications/types'

export function buildWhatsAppConfirmAction(
  payload: OrderNotificationPayload,
): WhatsAppConfirmAction | WhatsAppConfirmUnavailable {
  const storeWhatsapp = payload.storeWhatsapp?.trim()
  if (!storeWhatsapp || !isValidPkPhone(storeWhatsapp)) {
    return {
      available: false,
      url: null,
      label: 'WhatsApp confirmation unavailable',
      message: 'Add a Pakistani WhatsApp number in Store settings to enable order confirmation.',
    }
  }

  const message = customerWhatsAppMessage(payload)
  const url = `https://wa.me/${toWhatsAppNumber(storeWhatsapp)}?text=${encodeURIComponent(message)}`

  return {
    available: true,
    url,
    label: 'Confirm this order on WhatsApp',
    message,
  }
}
