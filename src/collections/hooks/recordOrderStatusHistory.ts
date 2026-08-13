import type { CollectionBeforeChangeHook } from 'payload'
import { isExceptionStatus } from '@/lib/orders'

type HistoryEntry = {
  status?: string | null
  paymentStatus?: string | null
  note?: string | null
  source?: string | null
  actor?: string | null
  at?: string | null
}

function asHistory(value: unknown): HistoryEntry[] {
  return Array.isArray(value) ? (value as HistoryEntry[]).map((entry) => ({ ...entry })) : []
}

export const recordOrderStatusHistory: CollectionBeforeChangeHook = ({ data, originalDoc, operation, req }) => {
  if (!data) return data

  const previousStatus = originalDoc?.status as string | undefined
  const nextStatus = (data.status as string | undefined) ?? previousStatus
  const previousPayment = originalDoc?.paymentStatus as string | undefined
  let nextPayment = (data.paymentStatus as string | undefined) ?? previousPayment

  if (
    operation === 'update' &&
    previousStatus !== 'delivered' &&
    nextStatus === 'delivered' &&
    nextPayment === 'unpaid'
  ) {
    data.paymentStatus = 'collected'
    nextPayment = 'collected'
  }

  const history =
    operation === 'update' ? asHistory(originalDoc?.statusHistory) : asHistory(data.statusHistory)
  const actor = typeof req.user?.email === 'string' ? req.user.email : undefined
  const reason = typeof data.statusReason === 'string' ? data.statusReason.trim() : ''

  if (operation === 'create' && history.length === 0) {
    history.push({
      status: nextStatus || 'pending',
      paymentStatus: nextPayment || 'unpaid',
      note: 'Order placed — cash on delivery',
      source: 'checkout',
      at: new Date().toISOString(),
    })
  }

  if (operation === 'update' && originalDoc && (previousStatus !== nextStatus || previousPayment !== nextPayment)) {
    const autoCollectNote =
      previousStatus !== 'delivered' && nextStatus === 'delivered' && previousPayment === 'unpaid' && nextPayment === 'collected'
        ? 'Cash marked collected on delivery'
        : undefined

    history.push({
      status: nextStatus,
      paymentStatus: nextPayment,
      note: reason || autoCollectNote || undefined,
      source: req.user ? 'admin' : 'system',
      actor,
      at: new Date().toISOString(),
    })
  }

  data.statusHistory = history

  if (nextStatus && !isExceptionStatus(nextStatus) && operation === 'update' && previousStatus !== nextStatus) {
    data.statusReason = null
  }

  return data
}
