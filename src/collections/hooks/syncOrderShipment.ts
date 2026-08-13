import type { CollectionBeforeChangeHook } from 'payload'
import { buildTrackingUrl, isShippingStatus } from '@/lib/shipping'

type ShipmentData = {
  courier?: number | string | { id?: number | string; name?: string; provider?: string; trackingUrlTemplate?: string | null } | null
  courierName?: string | null
  provider?: string | null
  trackingNumber?: string | null
  trackingUrl?: string | null
  externalId?: string | null
  shippingStatus?: string | null
  shipmentDate?: string | null
  deliveryDate?: string | null
  codAmount?: number | null
  lastSyncedAt?: string | null
  lastSyncError?: string | null
  notes?: string | null
}

function courierId(value: ShipmentData['courier']) {
  if (!value) return null
  if (typeof value === 'object') return value.id ?? null
  return value
}

export const syncOrderShipment: CollectionBeforeChangeHook = async ({ data, originalDoc, operation, req }) => {
  if (!data) return data

  const previous = (originalDoc?.shipment || {}) as ShipmentData
  const incoming = { ...previous, ...(data.shipment as ShipmentData | undefined) }
  const nextStatus = (data.status as string | undefined) ?? (originalDoc?.status as string | undefined)
  const previousStatus = originalDoc?.status as string | undefined
  const total = Number(data.total ?? originalDoc?.total ?? 0)
  const now = new Date().toISOString()

  const relatedId = courierId(incoming.courier)
  if (relatedId) {
    try {
      const courier = await req.payload.findByID({
        collection: 'couriers',
        id: relatedId,
        depth: 0,
        overrideAccess: true,
      })
      incoming.courierName = courier.name
      incoming.provider = courier.provider || 'manual'
      if (incoming.trackingNumber && courier.trackingUrlTemplate) {
        incoming.trackingUrl = buildTrackingUrl(courier.trackingUrlTemplate, incoming.trackingNumber)
      }
    } catch {
      incoming.provider = incoming.provider || 'manual'
    }
    incoming.courier = relatedId
  } else {
    incoming.provider = incoming.provider || 'manual'
    incoming.courier = null
  }

  if (incoming.codAmount === undefined || incoming.codAmount === null) {
    incoming.codAmount = total
  }

  if (!incoming.shippingStatus) {
    incoming.shippingStatus = 'not_booked'
  }

  const previousTracking = previous.trackingNumber?.trim()
  const nextTracking = incoming.trackingNumber?.trim()
  if (nextTracking && !previousTracking && incoming.shippingStatus === 'not_booked') {
    incoming.shippingStatus = 'booked'
  }

  if (!incoming.shipmentDate && (nextStatus === 'shipped' || nextStatus === 'out_for_delivery' || incoming.shippingStatus === 'picked_up' || incoming.shippingStatus === 'in_transit')) {
    incoming.shipmentDate = now
  }

  if (!incoming.deliveryDate && (nextStatus === 'delivered' || incoming.shippingStatus === 'delivered')) {
    incoming.deliveryDate = now
  }

  if (operation === 'update' && previousStatus !== nextStatus && nextStatus === 'delivered' && incoming.shippingStatus !== 'delivered') {
    incoming.shippingStatus = 'delivered'
  }

  if (!isShippingStatus(incoming.shippingStatus)) {
    incoming.shippingStatus = 'not_booked'
  }

  data.shipment = incoming
  return data
}
