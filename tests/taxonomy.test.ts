import { describe, expect, it } from 'vitest'
import { genderMatchesQuery, publicGenderLabel, SHOP_ALIASES, flagsFromDepartment, isUnisexPublicItem, stripUnisexCopy } from '@/lib/taxonomy'
import { parseCatalogSearchParams } from '@/lib/catalog-params'

describe('catalog taxonomy', () => {
  it('hides unisex from customer-facing labels', () => {
    expect(publicGenderLabel('boys')).toBe('Boys')
    expect(publicGenderLabel('girls')).toBe('Girls')
    expect(publicGenderLabel('unisex')).toBeNull()
    expect(publicGenderLabel(null)).toBeNull()
  })

  it('keeps legacy unisex products visible on boys and girls pages', () => {
    expect(genderMatchesQuery('unisex', 'boys')).toBe(true)
    expect(genderMatchesQuery('unisex', 'girls')).toBe(true)
    expect(genderMatchesQuery('boys', 'girls')).toBe(false)
    expect(genderMatchesQuery(null, 'boys')).toBe(false)
  })

  it('does not accept unisex as a shop filter', () => {
    const query = parseCatalogSearchParams({ gender: 'unisex' })
    expect(query.gender).toBeUndefined()
  })

  it('redirects retired category slugs', () => {
    expect(SHOP_ALIASES.unisex).toBe('/shop')
    expect(SHOP_ALIASES.footwear).toBe('/shop/kids-footwear')
    expect(SHOP_ALIASES['baby-accessories']).toBe('/shop/baby-kids-accessories')
  })

  it('strips Unisex from homepage copy and collection cards', () => {
    expect(stripUnisexCopy('Boys · Girls · Unisex')).toBe('Boys · Girls')
    expect(isUnisexPublicItem({ title: 'Unisex', href: '/shop/unisex' })).toBe(true)
    expect(isUnisexPublicItem({ title: 'Boys', href: '/shop/boys' })).toBe(false)
  })

  it('turns off kids age filters for women’s departments', () => {
    const flags = flagsFromDepartment({
      usesGender: false,
      usesAge: false,
      usesSize: false,
      usesHeight: false,
      usesColor: true,
      usesBrand: true,
      usesBagType: false,
      usesProductKind: true,
      usesSkinType: true,
    })
    expect(flags.age).toBe(false)
    expect(flags.gender).toBe(false)
    expect(flags.brand).toBe(true)
  })
})
