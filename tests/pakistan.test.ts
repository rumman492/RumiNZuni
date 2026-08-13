import { describe, expect, it } from 'vitest'
import {
  clampText,
  formatPkr,
  isPakistanCity,
  isValidEmail,
  isValidPkPhone,
  normalizePkPhone,
  toWhatsAppNumber,
} from '@/lib/pakistan'

describe('PK phone validation', () => {
  it('accepts local 03XXXXXXXXX numbers', () => {
    expect(isValidPkPhone('03001234567')).toBe(true)
    expect(isValidPkPhone('0312-3456789')).toBe(true)
    expect(isValidPkPhone('0300 123 4567')).toBe(true)
  })

  it('accepts +92 mobile numbers and normalizes them to local 03 form', () => {
    expect(isValidPkPhone('+923001234567')).toBe(true)
    expect(normalizePkPhone('+92 300 1234567')).toBe('03001234567')
    expect(normalizePkPhone('923001234567')).toBe('03001234567')
    expect(toWhatsAppNumber('03001234567')).toBe('923001234567')
  })

  it('rejects landlines, short numbers, and foreign mobiles', () => {
    expect(isValidPkPhone('02134567890')).toBe(false)
    expect(isValidPkPhone('0300123456')).toBe(false)
    expect(isValidPkPhone('030012345678')).toBe(false)
    expect(isValidPkPhone('+14155552671')).toBe(false)
    expect(isValidPkPhone('')).toBe(false)
  })
})

describe('Pakistan helpers', () => {
  it('only allows listed delivery cities', () => {
    expect(isPakistanCity('Karachi')).toBe(true)
    expect(isPakistanCity('Lahore')).toBe(true)
    expect(isPakistanCity('Dubai')).toBe(false)
  })

  it('formats PKR without decimals', () => {
    expect(formatPkr(250)).toBe('Rs 250')
    expect(formatPkr(3049.6)).toBe('Rs 3,050')
  })

  it('validates optional emails and clamps unsafe text', () => {
    expect(isValidEmail('hello@ruminzuni.com')).toBe(true)
    expect(isValidEmail('not-an-email')).toBe(false)
    expect(clampText('  Ayesha\u0000Khan  ', 80)).toBe('AyeshaKhan')
  })
})
