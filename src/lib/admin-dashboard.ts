import type { Payload } from 'payload'
import { formatProductSize } from '@/lib/pakistan'

export const LOW_STOCK_THRESHOLD = 5

const SALES_EXCLUDED = ['cancelled', 'refused', 'failed_delivery', 'returned'] as const

export type DashboardOrderRow = {
  id: number | string
  orderNumber: string
  customerName: string
  city?: string | null
  status: string
  total: number
  createdAt: string
}

export type DashboardStockRow = {
  productId: number | string
  title: string
  sku: string
  size: string
  color: string
  stock: number
}

export type AdminDashboardData = {
  todayLabel: string
  todayOrders: number
  todaySales: number
  pending: number
  confirmed: number
  shipped: number
  delivered: number
  returned: number
  recentToday: DashboardOrderRow[]
  lowStock: DashboardStockRow[]
}

/** Karachi is UTC+5 year-round. */
export function pakistanDayBounds(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const num = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value)
  const year = num('year')
  const month = num('month')
  const day = num('day')
  const startMs = Date.UTC(year, month - 1, day) - 5 * 60 * 60 * 1000
  return {
    start: new Date(startMs).toISOString(),
    end: new Date(startMs + 24 * 60 * 60 * 1000).toISOString(),
    label: new Intl.DateTimeFormat('en-PK', {
      timeZone: 'Asia/Karachi',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(now),
  }
}

function countByStatus(payload: Payload, status: string | string[]) {
  return payload.count({
    collection: 'orders',
    overrideAccess: true,
    where: Array.isArray(status)
      ? { status: { in: status } }
      : { status: { equals: status } },
  })
}

export async function getAdminDashboardData(payload: Payload): Promise<AdminDashboardData> {
  const { start, end, label } = pakistanDayBounds()
  const todayWhere = {
    and: [{ createdAt: { greater_than_equal: start } }, { createdAt: { less_than: end } }],
  }

  const [todayDocs, pending, confirmed, shipped, delivered, returned, products] =
    await Promise.all([
      payload.find({
        collection: 'orders',
        overrideAccess: true,
        where: todayWhere,
        sort: '-createdAt',
        limit: 200,
        depth: 0,
        select: {
          orderNumber: true,
          customerName: true,
          city: true,
          status: true,
          total: true,
          createdAt: true,
        },
      }),
      countByStatus(payload, 'pending'),
      countByStatus(payload, 'confirmed'),
      countByStatus(payload, 'shipped'),
      countByStatus(payload, 'delivered'),
      countByStatus(payload, 'returned'),
      payload.find({
        collection: 'products',
        overrideAccess: true,
        limit: 200,
        depth: 0,
        select: { title: true, variants: true },
      }),
    ])

  const todaySales = todayDocs.docs.reduce((sum, order) => {
    if (SALES_EXCLUDED.includes(order.status as (typeof SALES_EXCLUDED)[number])) return sum
    return sum + (order.total || 0)
  }, 0)

  const lowStock: DashboardStockRow[] = []
  for (const product of products.docs) {
    for (const variant of product.variants || []) {
      if (typeof variant.stock === 'number' && variant.stock <= LOW_STOCK_THRESHOLD) {
        lowStock.push({
          productId: product.id,
          title: product.title,
          sku: variant.sku,
          size: formatProductSize(variant.size),
          color: variant.color,
          stock: variant.stock,
        })
      }
    }
  }
  lowStock.sort((a, b) => a.stock - b.stock || a.title.localeCompare(b.title, 'en'))

  return {
    todayLabel: label,
    todayOrders: todayDocs.totalDocs,
    todaySales,
    pending: pending.totalDocs,
    confirmed: confirmed.totalDocs,
    shipped: shipped.totalDocs,
    delivered: delivered.totalDocs,
    returned: returned.totalDocs,
    recentToday: todayDocs.docs.slice(0, 8).map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      city: order.city,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
    })),
    lowStock: lowStock.slice(0, 12),
  }
}

export function adminPath(adminRoute: string, path: `/${string}`, where?: Record<string, string>) {
  const params = new URLSearchParams()
  if (where) {
    for (const [field, value] of Object.entries(where)) {
      params.set(`where[${field}][equals]`, value)
    }
  }
  const qs = params.toString()
  return qs ? `${adminRoute}${path}?${qs}` : `${adminRoute}${path}`
}
