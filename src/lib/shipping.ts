export const SHIPPING_STATUSES = [
  { value: 'not_booked', label: 'Not booked' },
  { value: 'booked', label: 'Booked' },
  { value: 'picked_up', label: 'Picked up' },
  { value: 'in_transit', label: 'In transit' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'failed', label: 'Failed' },
  { value: 'returned', label: 'Returned' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

export type ShippingStatus = (typeof SHIPPING_STATUSES)[number]['value']

/** Adapter ids. `manual` is the default; other ids are reserved for future courier APIs. */
export const COURIER_PROVIDERS = [
  { value: 'manual', label: 'Manual (no API)' },
  { value: 'tcs', label: 'TCS (future API)' },
  { value: 'leopard', label: 'Leopards (future API)' },
  { value: 'trax', label: 'Trax (future API)' },
  { value: 'postex', label: 'PostEx (future API)' },
  { value: 'callcourier', label: 'Call Courier (future API)' },
  { value: 'rider', label: 'Shop rider' },
  { value: 'other', label: 'Other' },
] as const

export type CourierProviderId = (typeof COURIER_PROVIDERS)[number]['value']

export type ShipmentSnapshot = {
  provider: string
  courierName?: string | null
  trackingNumber?: string | null
  trackingUrl?: string | null
  externalId?: string | null
  shippingStatus: ShippingStatus
  shipmentDate?: string | null
  deliveryDate?: string | null
  codAmount?: number | null
  lastSyncedAt?: string | null
  lastSyncError?: string | null
}

export type CourierAdapter = {
  id: string
  createShipment: (input: Record<string, unknown>) => Promise<Partial<ShipmentSnapshot>>
  trackShipment: (input: Record<string, unknown>) => Promise<Partial<ShipmentSnapshot>>
  cancelShipment?: (input: Record<string, unknown>) => Promise<Partial<ShipmentSnapshot>>
}

const adapters = new Map<string, CourierAdapter>()

const manualAdapter: CourierAdapter = {
  id: 'manual',
  async createShipment() {
    throw new Error('This courier is manual. Enter tracking details on the order. Connect an API adapter to book automatically.')
  },
  async trackShipment() {
    throw new Error('This courier is manual. Tracking updates are entered in Admin until an API adapter is connected.')
  },
}

adapters.set('manual', manualAdapter)

export function registerCourierAdapter(adapter: CourierAdapter) {
  adapters.set(adapter.id, adapter)
}

export function getCourierAdapter(providerId?: string | null): CourierAdapter {
  return adapters.get(providerId || 'manual') || manualAdapter
}

export function isShippingStatus(value: unknown): value is ShippingStatus {
  return SHIPPING_STATUSES.some((status) => status.value === value)
}

export function formatShippingStatus(status: string | null | undefined) {
  return SHIPPING_STATUSES.find((item) => item.value === status)?.label || status || 'Unknown'
}

export function buildTrackingUrl(template: string | null | undefined, trackingNumber: string | null | undefined) {
  const pattern = template?.trim()
  const cn = trackingNumber?.trim()
  if (!pattern || !cn) return null
  return pattern.replaceAll('{trackingNumber}', encodeURIComponent(cn)).replaceAll('{cn}', encodeURIComponent(cn))
}

export function quoteCodTotals(input: {
  subtotal: number
  city: string
  defaultShippingFee?: number | null
  freeShippingThreshold?: number | null
  cityShipping?: Array<{ city: string; fee: number }> | null
  codFee?: number | null
}) {
  const subtotal = Number(input.subtotal) || 0
  const defaultShipping = Number(input.defaultShippingFee || 250)
  const threshold = Number(input.freeShippingThreshold || 0)
  const cityRate = (input.cityShipping || []).find((rate) => rate.city === input.city)
  const shipping = threshold > 0 && subtotal >= threshold ? 0 : (cityRate?.fee ?? defaultShipping)
  const codFee = Number(input.codFee || 0)
  return {
    subtotal,
    shipping,
    codFee,
    total: subtotal + shipping + codFee,
  }
}

export function applyShipmentSnapshot(
  current: Partial<ShipmentSnapshot> | null | undefined,
  update: Partial<ShipmentSnapshot>,
): ShipmentSnapshot {
  return {
    provider: update.provider || current?.provider || 'manual',
    courierName: update.courierName ?? current?.courierName,
    trackingNumber: update.trackingNumber ?? current?.trackingNumber,
    trackingUrl: update.trackingUrl ?? current?.trackingUrl,
    externalId: update.externalId ?? current?.externalId,
    shippingStatus: update.shippingStatus || current?.shippingStatus || 'not_booked',
    shipmentDate: update.shipmentDate ?? current?.shipmentDate,
    deliveryDate: update.deliveryDate ?? current?.deliveryDate,
    codAmount: update.codAmount ?? current?.codAmount,
    lastSyncedAt: update.lastSyncedAt ?? current?.lastSyncedAt,
    lastSyncError: update.lastSyncError === undefined ? current?.lastSyncError : update.lastSyncError,
  }
}
