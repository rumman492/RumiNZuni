import { afterEach, describe, expect, it } from 'vitest'
import type { AccessArgs } from 'payload'
import { isAdmin, isOwner, anyone } from '@/access/isAdmin'
import { Orders } from '@/collections/Orders'
import { Products } from '@/collections/Products'
import { Users } from '@/collections/Users'
import { canViewOrderConfirmation, checkoutAccessToken } from '@/lib/checkout'
import { createOrderAccessToken, verifyOrderAccessToken } from '@/lib/order-access'
import { isSameOrigin, publicHttpUrl, RATE_LIMITS, rateLimit, resetRateLimits } from '@/lib/security'

function accessArgs(user: { id: number; email?: string; role?: string } | null) {
  return { req: { user } } as AccessArgs
}

describe('access control', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env.NODE_ENV = originalEnv.NODE_ENV
    process.env.NEXT_PUBLIC_SERVER_URL = originalEnv.NEXT_PUBLIC_SERVER_URL
    process.env.PAYLOAD_SECRET = originalEnv.PAYLOAD_SECRET
    resetRateLimits()
  })

  it('treats only signed-in staff as admins', () => {
    expect(isAdmin(accessArgs(null))).toBe(false)
    expect(isAdmin(accessArgs({ id: 1, email: 'admin@ruminzuni.com' }))).toBe(true)
    expect(anyone()).toBe(true)
  })

  it('blocks public order and user creation; guests only see published products', () => {
    expect(Orders.access.create(accessArgs(null))).toBe(false)
    expect(Orders.access.read(accessArgs(null))).toBe(false)
    expect(Orders.access.read(accessArgs({ id: 1 }))).toBe(true)
    expect(Orders.access.delete(accessArgs(null))).toBe(false)
    expect(Users.access.create(accessArgs(null))).toBe(false)
    expect(Users.access.create(accessArgs({ id: 1, role: 'staff' }))).toBe(false)
    expect(Users.access.create(accessArgs({ id: 1, role: 'admin' }))).toBe(true)
    expect(isOwner(accessArgs({ id: 1, role: 'admin' }))).toBe(true)
    expect(isOwner(accessArgs({ id: 2, role: 'staff' }))).toBe(false)
    expect(Products.access.read(accessArgs(null))).toEqual({ _status: { equals: 'published' } })
    expect(Products.access.read(accessArgs({ id: 1 }))).toBe(true)
    expect(Products.access.create(accessArgs(null))).toBe(false)
  })

  it('requires a signed confirmation token to view an order page', () => {
    process.env.PAYLOAD_SECRET = 'test-order-secret'
    const orderNumber = 'RNZ-20260813-123456'
    const token = createOrderAccessToken(orderNumber)
    expect(checkoutAccessToken(orderNumber)).toBe(token)
    expect(verifyOrderAccessToken(orderNumber, token)).toBe(true)
    expect(canViewOrderConfirmation(orderNumber, token)).toBe(true)
    expect(canViewOrderConfirmation(orderNumber, 'not-a-real-token-value')).toBe(false)
    expect(canViewOrderConfirmation(orderNumber, '')).toBe(false)
    expect(canViewOrderConfirmation('ORDER-1', token)).toBe(false)
  })

  it('rejects cross-origin checkout in production', () => {
    process.env.NODE_ENV = 'production'
    process.env.NEXT_PUBLIC_SERVER_URL = 'https://ruminzuni.com'
    const headers = (origin: string) => ({ headers: new Headers({ origin }) })
    expect(isSameOrigin(headers('https://ruminzuni.com'))).toBe(true)
    expect(isSameOrigin(headers('https://evil.example'))).toBe(false)
  })

  it('rate-limits repeated checkout attempts from the same IP', () => {
    resetRateLimits()
    for (let i = 0; i < RATE_LIMITS.checkoutIp.limit; i += 1) {
      expect(rateLimit('checkout:ip:1.1.1.1', RATE_LIMITS.checkoutIp.limit, RATE_LIMITS.checkoutIp.windowMs).ok).toBe(true)
    }
    expect(rateLimit('checkout:ip:1.1.1.1', RATE_LIMITS.checkoutIp.limit, RATE_LIMITS.checkoutIp.windowMs).ok).toBe(false)
  })

  it('only returns http(s) tracking URLs to customers', () => {
    expect(publicHttpUrl('https://track.example/abc')).toBe('https://track.example/abc')
    expect(publicHttpUrl('javascript:alert(1)')).toBeNull()
    expect(publicHttpUrl('ftp://files.example/x')).toBeNull()
  })
})
