import { afterEach, describe, expect, it } from 'vitest'
import { assertProductionEnv, assertStrongPassword, isWeakSecret } from '@/lib/env'

describe('production secrets and admin passwords', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env.NODE_ENV = originalEnv.NODE_ENV
    process.env.NEXT_PHASE = originalEnv.NEXT_PHASE
    process.env.PAYLOAD_SECRET = originalEnv.PAYLOAD_SECRET
    process.env.DATABASE_URL = originalEnv.DATABASE_URL
    process.env.NEXT_PUBLIC_SERVER_URL = originalEnv.NEXT_PUBLIC_SERVER_URL
  })

  it('rejects documented and short secrets', () => {
    expect(isWeakSecret('')).toBe(true)
    expect(isWeakSecret('change-me-even-longer')).toBe(true)
    expect(isWeakSecret('build-only-secret-not-used-at-runtime')).toBe(true)
    expect(isWeakSecret('ruminzuni-dev-secret-change-before-production-9f3a2c')).toBe(true)
    expect(isWeakSecret('short')).toBe(true)
    expect(isWeakSecret('a'.repeat(32))).toBe(false)
  })

  it('rejects example admin passwords and weak shapes', () => {
    expect(() => assertStrongPassword('ChangeMeNow1')).toThrow(/not allowed/)
    expect(() => assertStrongPassword('short1A')).toThrow(/12/)
    expect(() => assertStrongPassword('alllowercase12')).toThrow(/uppercase/)
    expect(() => assertStrongPassword('ShopOwnerPass9')).not.toThrow()
  })

  it('refuses to boot production with example database or secret values', () => {
    process.env.NODE_ENV = 'production'
    delete process.env.NEXT_PHASE
    process.env.PAYLOAD_SECRET = 'change-this-to-a-long-random-string'
    process.env.DATABASE_URL = 'postgresql://ruminzuni:ruminzuni@postgres:5432/ruminzuni'
    process.env.NEXT_PUBLIC_SERVER_URL = 'https://ruminzuni.com'
    expect(() => assertProductionEnv()).toThrow(/PAYLOAD_SECRET/)

    process.env.PAYLOAD_SECRET = 'x'.repeat(32)
    process.env.DATABASE_URL = 'postgresql://ruminzuni:ruminzuni@postgres:5432/ruminzuni'
    expect(() => assertProductionEnv()).toThrow(/DATABASE_URL/)
  })

  it('allows a unique production secret and postgres URL', () => {
    process.env.NODE_ENV = 'production'
    delete process.env.NEXT_PHASE
    process.env.PAYLOAD_SECRET = 'f'.repeat(32)
    process.env.DATABASE_URL = 'postgresql://ruminzuni:unique-db-pass@postgres:5432/ruminzuni'
    process.env.NEXT_PUBLIC_SERVER_URL = 'https://ruminzuni.com'
    expect(() => assertProductionEnv()).not.toThrow()
  })
})
