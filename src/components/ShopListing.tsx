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

export async function ShopListing({
  title,
  description,
  basePath,
  query,
  locked,
  breadcrumbs,
}: {
  title: string
  description?: string
  basePath: string
  query: CatalogQuery
  locked?: CatalogLock
  breadcrumbs?: BreadcrumbItem[]
}) {
  let facets: Awaited<ReturnType<typeof getCatalogFacets>> = {
    categories: [],
    colors: [],
    ageGroups: shopAgeOptions(),
    sizes: shopSizeOptions(),
  }
  let result: Awaited<ReturnType<typeof searchCatalog>> = {
    products: [],
    cards: [],
    total: 0,
    page: 1,
    pageCount: 1,
  }

  try {
    ;[facets, result] = await Promise.all([getCatalogFacets(), searchCatalog(query)])
  } catch {
    result = { products: [], cards: [], total: 0, page: 1, pageCount: 1 }
  }

  const start = result.total === 0 ? 0 : (result.page - 1) * CATALOG_PAGE_SIZE + 1
  const end = Math.min(result.page * CATALOG_PAGE_SIZE, result.total)

  return (
    <div>
      {breadcrumbs && breadcrumbs.length > 0 ? <Breadcrumbs items={breadcrumbs} /> : null}
      <p className="inline-flex rounded-full bg-lemon px-3 py-1 text-sm font-bold uppercase tracking-wide text-ink">
        Kids wear
      </p>
      <h1 className="display mt-3 text-5xl">{title}</h1>
      {description ? <p className="mt-3 max-w-2xl text-ink-soft">{description}</p> : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[17rem_1fr]">
        <aside>
          <details className="rounded-3xl bg-white p-5 shadow-sm" open>
            <summary className="cursor-pointer font-bold lg:hidden">Filters</summary>
            <div className="mt-4 lg:mt-0">
              <ShopFilters
                key={catalogQueryString(query)}
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
              {result.total === 0 ? 'No outfits match these filters.' : `Showing ${start}–${end} of ${result.total}`}
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
