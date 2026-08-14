import Link from 'next/link'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ProductCard } from '@/components/ProductCard'
import { ShopFilters, ShopSort } from '@/components/ShopFilters'
import type { BreadcrumbItem } from '@/lib/seo'
import {
  CATALOG_PAGE_SIZE,
  catalogHref,
  catalogQueryString,
  getCatalogFacets,
  searchCatalog,
  type CatalogLock,
  type CatalogQuery,
} from '@/lib/catalog'
import { shopAgeOptions, shopSizeOptions } from '@/lib/sizing'
import { GLOBAL_SHOP_FILTERS, shopFacetLabel } from '@/lib/taxonomy'

export async function ShopListing({
  title,
  description,
  basePath,
  query,
  locked,
  breadcrumbs,
  hubs,
}: {
  title: string
  description?: string
  basePath: string
  query: CatalogQuery
  locked?: CatalogLock
  breadcrumbs?: BreadcrumbItem[]
  hubs?: Array<{ href: string; title: string; copy: string; image: string | null }>
}) {
  let facets: Awaited<ReturnType<typeof getCatalogFacets>> = {
    departments: [],
    categories: [],
    colors: [],
    brands: [],
    bagTypes: [],
    productKinds: [],
    skinTypes: [],
    materials: [],
    patterns: [],
    finishes: [],
    skinTones: [],
    skinConcerns: [],
    fragranceFamilies: [],
    fragranceTypes: [],
    volumes: [],
    spfs: [],
    ageGroups: shopAgeOptions(),
    sizes: shopSizeOptions(),
    filters: { ...GLOBAL_SHOP_FILTERS },
  }
  let result: Awaited<ReturnType<typeof searchCatalog>> = {
    products: [],
    cards: [],
    total: 0,
    page: 1,
    pageCount: 1,
  }

  try {
    ;[facets, result] = await Promise.all([getCatalogFacets(query), searchCatalog(query)])
  } catch {
    result = { products: [], cards: [], total: 0, page: 1, pageCount: 1 }
  }

  const eyebrow = shopFacetLabel(
    locked?.category ||
      (locked?.department === 'kids-wear' && locked.gender === 'boys'
        ? 'boys'
        : locked?.department === 'kids-wear' && locked.gender === 'girls'
          ? 'girls'
          : locked?.department === 'baby-kids-accessories'
            ? 'baby-kids-accessories'
            : locked?.department === 'kids-footwear'
              ? 'kids-footwear'
              : query.category || ''),
    locked?.audience === 'women' || locked?.department === 'womens' ? "Women's" : 'Shop',
  )
  const start = result.total === 0 ? 0 : (result.page - 1) * CATALOG_PAGE_SIZE + 1
  const end = Math.min(result.page * CATALOG_PAGE_SIZE, result.total)

  return (
    <div>
      {breadcrumbs && breadcrumbs.length > 0 ? <Breadcrumbs items={breadcrumbs} /> : null}
      <p className="inline-flex rounded-full bg-lemon px-3 py-1 text-sm font-bold uppercase tracking-wide text-ink">
        {eyebrow}
      </p>
      <h1 className="display mt-3 text-5xl">{title}</h1>
      {description ? <p className="mt-3 max-w-2xl text-ink-soft">{description}</p> : null}

      {hubs && hubs.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {hubs.map((hub) => (
            <Link
              key={hub.href}
              href={hub.href}
              className="play-pop overflow-hidden rounded-[1.75rem] bg-white shadow-sm"
            >
              {hub.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={hub.image} alt={hub.title} className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="grid aspect-[4/3] place-items-center bg-sand text-sm font-semibold text-ink-soft">
                  {hub.title}
                </div>
              )}
              <div className="px-4 py-4">
                <h2 className="font-bold">{hub.title}</h2>
                <p className="mt-1 text-sm text-ink-soft">{hub.copy}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[17rem_1fr]">
        <aside>
          <div className="hidden lg:block rounded-3xl bg-white p-5 shadow-sm">
            <ShopFilters
              key={catalogQueryString(query)}
              basePath={basePath}
              query={query}
              facets={facets}
              locked={locked}
            />
          </div>
          <details className="rounded-3xl bg-white p-5 shadow-sm lg:hidden">
            <summary className="cursor-pointer font-bold">Filters</summary>
            <div className="mt-4">
              <ShopFilters
                key={`m-${catalogQueryString(query)}`}
                basePath={basePath}
                query={query}
                facets={facets}
                locked={locked}
              />
            </div>
          </details>
        </aside>

        <div>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink-soft">
              {result.total === 0 ? 'No products match these filters.' : `Showing ${start}–${end} of ${result.total}`}
            </p>
            <ShopSort key={`sort-${catalogQueryString(query)}`} basePath={basePath} query={query} />
          </div>

          {result.cards.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-ink-soft">
              <p>Nothing matches yet. Try another size, colour, or clear filters.</p>
              <Link href={basePath} className="mt-4 inline-block text-sm font-bold text-coral">
                Reset filters
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {result.cards.map((product) => (
                <ProductCard key={product.slug} {...product} />
              ))}
            </div>
          )}

          {result.pageCount > 1 ? (
            <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
              {result.page > 1 ? (
                <Link
                  href={catalogHref(basePath, { ...query, page: result.page - 1 })}
                  className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-bold"
                  rel="prev"
                >
                  Previous
                </Link>
              ) : null}
              {Array.from({ length: result.pageCount }, (_, index) => index + 1).map((page) => (
                <Link
                  key={page}
                  href={catalogHref(basePath, { ...query, page })}
                  className={`grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm font-bold ${
                    page === result.page ? 'bg-coral text-white' : 'border border-ink/10 bg-white'
                  }`}
                  aria-current={page === result.page ? 'page' : undefined}
                >
                  {page}
                </Link>
              ))}
              {result.page < result.pageCount ? (
                <Link
                  href={catalogHref(basePath, { ...query, page: result.page + 1 })}
                  className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-bold"
                  rel="next"
                >
                  Next
                </Link>
              ) : null}
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  )
}
