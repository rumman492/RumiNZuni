import { describe, expect, it } from 'vitest'
import { recommendSize, sizeCodesForAgeGroup, sizeCodesForHeightRange, DEFAULT_AGE_GROUPS, DEFAULT_SIZES } from '@/lib/sizing'

describe('height-first sizing', () => {
  it('recommends 6–7 years for a 6 year old who is 119 cm', () => {
    const result = recommendSize({ heightCm: 119, ageYears: 6 })
    expect(result?.size.code).toBe('6y')
    expect(result?.size.label).toBe('6–7 years')
  })

  it('uses height when age would suggest a different band', () => {
    const result = recommendSize({ heightCm: 119, ageYears: 8 })
    expect(result?.size.code).toBe('6y')
  })

  it('keeps pre-teen sizes off the storefront until enabled', () => {
    expect(DEFAULT_SIZES.find((size) => size.code === '13-14y')?.storefrontVisible).toBe(false)
    expect(DEFAULT_AGE_GROUPS.find((group) => group.slug === 'pre-teen')?.storefrontVisible).toBe(false)
  })

  it('filters products by overlapping height range', () => {
    expect(sizeCodesForHeightRange(DEFAULT_SIZES, 118, 120)).toContain('6y')
    expect(sizeCodesForHeightRange(DEFAULT_SIZES, 118, 120)).not.toContain('newborn')
  })

  it('maps kids age group to height-based size codes', () => {
    const kids = DEFAULT_AGE_GROUPS.find((group) => group.slug === 'kids')
    expect(kids).toBeTruthy()
    const codes = sizeCodesForAgeGroup(DEFAULT_SIZES, kids!)
    expect(codes).toEqual(expect.arrayContaining(['6y', '7-8y']))
  })
})
