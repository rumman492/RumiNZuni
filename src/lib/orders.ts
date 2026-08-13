export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refused', label: 'Refused at door' },
  { value: 'failed_delivery', label: 'Failed delivery' },
  { value: 'returned', label: 'Returned' },
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]['value']

export const PAYMENT_STATUSES = [
  { value: 'unpaid', label: 'Unpaid (collect on delivery)' },
  { value: 'collected', label: 'Collected' },
  { value: 'refunded', label: 'Refunded' },
] as const

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]['value']

export const EXCEPTION_STATUSES: OrderStatus[] = ['cancelled', 'refused', 'failed_delivery', 'returned']

const CUSTOMER_STATUS_COPY: Record<OrderStatus, string> = {
  pending: 'We have your cash-on-delivery order and will confirm it on WhatsApp.',
  confirmed: 'Order confirmed. We are getting it ready.',
  packed: 'Packed and ready to leave the shop.',
  shipped: 'Handed to the courier.',
  out_for_delivery: 'Out for delivery. Please keep cash ready for the rider.',
  delivered: 'Delivered. Thank you for paying the rider.',
  cancelled: 'This order was cancelled.',
  refused: 'Delivery was refused at the door. WhatsApp us if this was a mistake.',
  failed_delivery: 'The rider could not complete delivery. We will contact you to reschedule.',
  returned: 'The parcel was returned to the shop.',
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return ORDER_STATUSES.some((status) => status.value === value)
}

export function isExceptionStatus(status: string | null | undefined) {
  return Boolean(status && EXCEPTION_STATUSES.includes(status as OrderStatus))
}

export function formatOrderStatus(status: string | null | undefined) {
  return ORDER_STATUSES.find((item) => item.value === status)?.label || status || 'Unknown'
}

export function formatPaymentStatus(status: string | null | undefined) {
  if (status === 'collected') return 'Payment collected'
  if (status === 'refunded') return 'Refunded'
  if (status === 'unpaid') return 'Pay cash on delivery'
  return status || 'Unknown'
}

export function orderStatusMessage(status: string | null | undefined) {
  if (isOrderStatus(status)) return CUSTOMER_STATUS_COPY[status]
  return 'We will update this order on WhatsApp.'
}
