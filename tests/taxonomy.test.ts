import { describe, expect, it } from 'vitest'
import { flagsForShopQuery, genderMatchesQuery, publicGenderLabel, SHOP_ALIASES, flagsFromDepartment, isUnisexPublicItem, shopFacetSlugsForQuery, stripUnisexCopy, catalogSectionIndex, buildStorefrontNav } from '@/lib/taxonomy'
import { SHOP_PRESETS, parseCatalogSearchParams } from '@/lib/catalog-params'
import { slugify } from '@/lib/slug'

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

  it('keeps boys and girls pages on kids wear only', () => {
    expect(SHOP_PRESETS.boys.department).toBe('kids-wear')
    expect(SHOP_PRESETS.girls.department).toBe('kids-wear')
    expect(SHOP_PRESETS.womens.department).toBe('womens')
  })

  it('lists departments on the main shop page', () => {
    expect(shopFacetSlugsForQuery({})).toEqual([
      'kids-wear',
      'baby-kids-accessories',
      'kids-footwear',
      'womens',
    ])
    expect(shopFacetSlugsForQuery({ department: 'kids-wear', gender: 'boys' })).toEqual([])
    expect(shopFacetSlugsForQuery({ department: 'womens', audience: 'women' })).toEqual([
      'handbags',
      'beauty',
      'skincare',
      'perfumes',
      'hair-care',
      'body-care',
      'beauty-tools',
    ])
    expect(shopFacetSlugsForQuery({ department: 'baby-kids-accessories' })).toEqual([])
    expect(shopFacetSlugsForQuery({ department: 'kids-footwear' })).toEqual([])
  })

  it('keeps the unfiltered shop on global filters only', () => {
    const all = flagsForShopQuery({})
    expect(all.age).toBe(false)
    expect(all.size).toBe(false)
    expect(all.gender).toBe(false)
    expect(all.bagType).toBe(false)
  })

  it('uses clothing filters for boys wear and women’s filters for bags', () => {
    const boys = flagsForShopQuery({ department: 'kids-wear', gender: 'boys' })
    expect(boys.age).toBe(true)
    expect(boys.size).toBe(true)
    expect(boys.height).toBe(true)
    expect(boys.bagType).toBe(false)
    expect(boys.gender).toBe(false)

    const accessories = flagsForShopQuery({ department: 'baby-kids-accessories' })
    expect(accessories.gender).toBe(true)
    expect(accessories.age).toBe(true)
    expect(accessories.height).toBe(false)
    expect(accessories.size).toBe(false)

    const footwear = flagsForShopQuery({ department: 'kids-footwear' })
    expect(footwear.size).toBe(true)
    expect(footwear.height).toBe(false)
    expect(footwear.bagType).toBe(false)

    const bags = flagsForShopQuery({ category: 'handbags', audience: 'women' })
    expect(bags.age).toBe(false)
    expect(bags.size).toBe(false)
    expect(bags.bagType).toBe(true)
    expect(bags.material).toBe(true)
    expect(bags.skinType).toBe(false)

    const makeup = flagsForShopQuery({ category: 'beauty' })
    expect(makeup.age).toBe(false)
    expect(makeup.gender).toBe(false)
    expect(makeup.finish).toBe(true)
    expect(makeup.productKind).toBe(true)

    const perfume = flagsForShopQuery({ category: 'perfumes' })
    expect(perfume.age).toBe(false)
    expect(perfume.fragranceFamily).toBe(true)
    expect(perfume.volume).toBe(true)
  })

  it('orders catalog sections clothing first, then extras, then women’s', () => {
    expect(catalogSectionIndex('boys')).toBeLessThan(catalogSectionIndex('girls'))
    expect(catalogSectionIndex('girls')).toBeLessThan(catalogSectionIndex('baby-kids-accessories'))
    expect(catalogSectionIndex('kids-footwear')).toBeLessThan(catalogSectionIndex('handbags'))
    expect(catalogSectionIndex('handbags')).toBeLessThan(catalogSectionIndex('skincare'))
  })

  it('maps shareable shop URLs onto departments and search', () => {
    expect(parseCatalogSearchParams({ category: 'kids-wear', gender: 'boys' })).toMatchObject({
      department: 'kids-wear',
      gender: 'boys',
    })
    expect(parseCatalogSearchParams({ category: 'womens', subcategory: 'skincare' })).toMatchObject({
      department: 'womens',
      category: 'skincare',
      audience: 'women',
    })
    expect(parseCatalogSearchParams({ search: 'blue shirt' }).q).toBe('blue shirt')
  })

  it('builds product slugs from titles for staff', () => {
    expect(slugify('Boys Navy Polo')).toBe('boys-navy-polo')
  })

  it('nests Kids Wear and Women’s into header dropdowns', () => {
    const nav = buildStorefrontNav()
    const kids = nav.find((item) => item.href === '/shop/kids-wear')
    const women = nav.find((item) => item.href === '/shop/womens')
    expect(kids?.children?.map((item) => item.href)).toEqual([
      '/shop/boys',
      '/shop/girls',
      '/shop/baby-kids-accessories',
      '/shop/kids-footwear',
    ])
    expect(women?.children?.map((item) => item.href)).toEqual(['/shop/handbags', '/shop/beauty-care'])
    expect(women?.children?.[1]?.children?.map((item) => item.label)).toEqual(['Makeup', 'Skincare', 'Perfumes'])
    expect(nav.some((item) => item.href === '/shop/boys')).toBe(false)
  })

  it('keeps kids collections first and adds Women’s handbags and beauty on the home page', async () => {
    const { homepageCollections, splitHomeCollections } = await import('@/lib/homepage')
    const { kids, women } = splitHomeCollections(homepageCollections(null))
    expect(kids.map((item) => item.href)).toEqual([
      '/shop/boys',
      '/shop/girls',
      '/shop/newborn',
      '/shop/baby-kids-accessories',
      '/shop/kids-footwear',
    ])
    expect(women.map((item) => item.href)).toEqual([
      '/shop/handbags',
      '/shop/beauty',
      '/shop/skincare',
      '/shop/perfumes',
    ])
    const fromLegacy = splitHomeCollections(
      homepageCollections({
        homeCollections: [
          { title: 'Boys', href: '/shop/boys' },
          { title: 'Girls', href: '/shop/girls' },
          { title: 'Newborn', href: '/shop/newborn' },
          { title: 'Unisex', href: '/shop/unisex' },
        ],
      }),
    )
    expect(fromLegacy.kids.map((item) => item.href)).toEqual([
      '/shop/boys',
      '/shop/girls',
      '/shop/newborn',
      '/shop/baby-kids-accessories',
    ])
  })
})

describe('women’s sample catalog', () => {
  it('keeps at least nine pictured samples for each active Women’s category', async () => {
    const { extraSamplesByCategory } = await import('@/lib/seedSamples')
    const pools = extraSamplesByCategory({
      categories: { handbags: 1, beauty: 2, skincare: 3, perfumes: 4 },
      ageGroupIds: {},
      tags: {},
      departments: {
        'womens-handbags': 10,
        'womens-beauty': 11,
        'womens-skincare': 12,
        'womens-perfumes': 13,
      },
    })
    for (const slug of ['handbags', 'beauty', 'skincare', 'perfumes']) {
      expect(pools[slug].length).toBeGreaterThanOrEqual(9)
      expect(pools[slug].every((item) => item.imageFile.endsWith('.jpg'))).toBe(true)
    }
  })
})
