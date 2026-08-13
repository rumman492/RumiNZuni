import { sql } from '@payloadcms/db-postgres'
import type { PayloadRequest } from 'payload'

export class CheckoutError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'CheckoutError'
    this.status = status
  }
}

export class StockReservationError extends CheckoutError {
  constructor(message: string) {
    super(message, 409)
    this.name = 'StockReservationError'
  }
}

export type CheckoutLine = {
  productId: number
  sku: string
  qty: number
}

type StockRow = {
  id: number | string | null
  stock_before: number | string | null
  stock_after: number | string | null
}

function isSafeIdent(name: string) {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)
}

function asNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) return null
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function queryRows<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[]
  if (result && typeof result === 'object' && 'rows' in result) {
    return (result as { rows: T[] }).rows || []
  }
  return []
}

function resolveVariantsTableName(req: PayloadRequest) {
  const adapter = req.payload.db
  const mapped = adapter.tableNameMap?.get('products_variants')
  if (mapped && isSafeIdent(mapped)) return mapped
  if (adapter.tables && 'products_variants' in adapter.tables) return 'products_variants'
  throw new CheckoutError('Inventory is unavailable because PostgreSQL product variants could not be resolved.', 500)
}

type ExecutableDb = {
  execute: (query: ReturnType<typeof sql>) => Promise<unknown>
}

async function getTransactionDb(req: PayloadRequest): Promise<ExecutableDb> {
  const adapter = req.payload.db
  if (!req.transactionID) {
    throw new CheckoutError('Inventory changes require a database transaction.', 500)
  }
  const transactionID = await req.transactionID
  const session = transactionID ? adapter.sessions?.[String(transactionID)] : undefined
  const client = (session?.db || adapter.drizzle) as ExecutableDb | undefined
  if (!client || typeof client.execute !== 'function') {
    throw new CheckoutError('Inventory is unavailable because the database session is not ready.', 500)
  }
  return client
}

/**
 * Merge duplicate product+SKU lines and sort them so concurrent checkouts
 * lock rows in a consistent order (avoids deadlocks).
 */
export function normalizeCheckoutLines(
  items: Array<{ productId: string | number; sku: string; qty: number }>,
): CheckoutLine[] {
  const merged = new Map<string, CheckoutLine>()

  for (const item of items) {
    const productId = typeof item.productId === 'number' ? item.productId : Number(item.productId)
    const sku = String(item.sku || '').trim()
    const qty = Number(item.qty)

    if (!Number.isInteger(productId) || productId < 1 || !sku || !Number.isInteger(qty) || qty < 1 || qty > 20) {
      throw new CheckoutError('One of the cart items is invalid.')
    }

    const key = `${productId}:${sku}`
    const existing = merged.get(key)
    const nextQty = (existing?.qty || 0) + qty
    if (nextQty > 20) {
      throw new CheckoutError('One of the cart items is invalid.')
    }
    merged.set(key, { productId, sku, qty: nextQty })
  }

  return [...merged.values()].sort((a, b) => a.productId - b.productId || a.sku.localeCompare(b.sku))
}

export type ReserveStockResult =
  | { ok: true; remaining: number }
  | { ok: false; reason: 'missing' | 'insufficient'; available: number }

/**
 * Lock the variant row and decrement stock only if enough units remain.
 * Must run inside an open Payload/Postgres transaction. A failed result
 * means the caller must roll back so inventory stays unchanged.
 */
export async function reserveVariantStock(
  req: PayloadRequest,
  line: CheckoutLine,
): Promise<ReserveStockResult> {
  const db = await getTransactionDb(req)
  const tableName = resolveVariantsTableName(req)
  const table = sql.raw(`"${tableName}"`)

  const result = await db.execute(sql`
      WITH locked AS (
        SELECT id, stock
        FROM ${table}
        WHERE "_parent_id" = ${line.productId}
          AND sku = ${line.sku}
        ORDER BY id
        LIMIT 1
        FOR UPDATE
      ),
      updated AS (
        UPDATE ${table} AS v
        SET stock = v.stock - ${line.qty}
        FROM locked
        WHERE v.id = locked.id
          AND locked.stock >= ${line.qty}
        RETURNING v.stock
      )
      SELECT
        locked.id,
        locked.stock AS stock_before,
        updated.stock AS stock_after
      FROM locked
      LEFT JOIN updated ON true
    `)

  const row = queryRows<StockRow>(result)[0]
  if (!row?.id) {
    return { ok: false, reason: 'missing', available: 0 }
  }

  const remaining = asNumber(row.stock_after)
  if (remaining === null) {
    return { ok: false, reason: 'insufficient', available: asNumber(row.stock_before) ?? 0 }
  }

  return { ok: true, remaining }
}
