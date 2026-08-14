'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  GENDER_OPTIONS,
  SORT_OPTIONS,
  catalogFilterChips,
  catalogHref,
  type CatalogFacets,
  type CatalogLock,
  type CatalogQuery,
} from '@/lib/catalog-params'

type Props = {
  basePath: string
  query: CatalogQuery
  facets: CatalogFacets
  locked?: CatalogLock
}

const selectClass =
  'mt-1 w-full rounded-2xl border border-ink/10 bg-cream px-3 py-2 text-sm outline-none focus:border-coral'
const inputClass =
  'mt-1 w-full rounded-2xl border border-ink/10 bg-cream px-3 py-2 text-sm outline-none focus:border-coral'

export function ShopFilters({ basePath, query, facets, locked }: Props) {
  const router = useRouter()
  const chips = catalogFilterChips(query, facets).filter((chip) => {
    if (chip.key === 'gender' && locked?.gender) return false
    if (chip.key === 'age' && locked?.age) return false
    if (chip.key === 'category' && locked?.category) return false
    return true
  })

  function apply(form: HTMLFormElement) {
    const data = new FormData(form)
    const next: CatalogQuery = {
      sort: query.sort,
      q: String(data.get('q') || '').trim() || undefined,
      category: locked?.category || String(data.get('category') || '').trim() || undefined,
      gender: locked?.gender || String(data.get('gender') || '').trim() || undefined,
      age: locked?.age || String(data.get('age') || '').trim() || undefined,
      size: String(data.get('size') || '').trim() || undefined,
      color: String(data.get('color') || '').trim() || undefined,
      min: Number.isFinite(Number(data.get('min'))) && String(data.get('min')).trim() ? Number(data.get('min')) : undefined,
      max: Number.isFinite(Number(data.get('max'))) && String(data.get('max')).trim() ? Number(data.get('max')) : undefined,
      heightMin:
        Number.isFinite(Number(data.get('heightMin'))) && String(data.get('heightMin')).trim()
          ? Number(data.get('heightMin'))
          : undefined,
      heightMax:
        Number.isFinite(Number(data.get('heightMax'))) && String(data.get('heightMax')).trim()
          ? Number(data.get('heightMax'))
          : undefined,
      inStock: data.get('inStock') === '1',
      page: 1,
    }
    router.push(catalogHref(basePath, next))
  }

  return (
    <div>
      <form
        action={basePath}
        method="get"
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          apply(event.currentTarget)
        }}
        onChange={(event) => {
          const target = event.target as HTMLElement
          if (target.tagName === 'SELECT' || (target as HTMLInputElement).type === 'checkbox') {
            apply(event.currentTarget)
          }
        }}
      >
        {query.sort && query.sort !== 'featured' ? <input type="hidden" name="sort" value={query.sort} /> : null}
        {locked?.category ? <input type="hidden" name="category" value={locked.category} /> : null}
        {locked?.gender ? <input type="hidden" name="gender" value={locked.gender} /> : null}
        {locked?.age ? <input type="hidden" name="age" value={locked.age} /> : null}

        <label className="text-sm font-semibold">
          Search
          <input
            className={inputClass}
            type="search"
            name="q"
            defaultValue={query.q || ''}
            placeholder="Romper, polo, frock…"
            autoComplete="off"
          />
        </label>

        {!locked?.category ? (
          <label className="text-sm font-semibold">
            Category
            <select className={selectClass} name="category" defaultValue={query.category || ''}>
              <option value="">All categories</option>
              {facets.categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {!locked?.gender ? (
          <label className="text-sm font-semibold">
            Gender
            <select className={selectClass} name="gender" defaultValue={query.gender || ''}>
              <option value="">All</option>
              {GENDER_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {!locked?.age ? (
          <label className="text-sm font-semibold">
            Age group
            <select className={selectClass} name="age" defaultValue={query.age || ''}>
              <option value="">All ages</option>
              {facets.ageGroups.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="text-sm font-semibold">
          Size
          <select className={selectClass} name="size" defaultValue={query.size || ''}>
            <option value="">All sizes</option>
            {facets.sizes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label} · {item.height}
              </option>
            ))}
          </select>
        </label>

        <div>
          <p className="text-sm font-semibold">Height (cm)</p>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <input
              className={inputClass}
              type="number"
              name="heightMin"
              min={40}
              max={200}
              inputMode="numeric"
              placeholder="From"
              defaultValue={query.heightMin ?? ''}
            />
            <input
              className={inputClass}
              type="number"
              name="heightMax"
              min={40}
              max={200}
              inputMode="numeric"
              placeholder="To"
              defaultValue={query.heightMax ?? ''}
            />
          </div>
        </div>

        <label className="text-sm font-semibold">
          Colour
          <select className={selectClass} name="color" defaultValue={query.color || ''}>
            <option value="">All colours</option>
            {facets.colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </label>

        <div>
          <p className="text-sm font-semibold">Price (PKR)</p>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <input
              className={inputClass}
              type="number"
              name="min"
              min={0}
              step={50}
              inputMode="numeric"
              placeholder="Min"
              defaultValue={query.min ?? ''}
            />
            <input
              className={inputClass}
              type="number"
              name="max"
              min={0}
              step={50}
              inputMode="numeric"
              placeholder="Max"
              defaultValue={query.max ?? ''}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="inStock" value="1" defaultChecked={query.inStock} className="accent-coral" />
          In stock only
        </label>

        <button type="submit" className="rounded-full bg-coral px-4 py-2 text-sm font-bold text-white">
          Apply filters
        </button>
      </form>

      {chips.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((chip) => {
            const next = { ...query, [chip.key]: undefined, page: 1 } as CatalogQuery
            if (chip.key === 'inStock') next.inStock = false
            if (chip.key === 'heightMin') next.heightMin = undefined
            if (chip.key === 'heightMax') next.heightMax = undefined
            return (
              <Link
                key={chip.key}
                href={catalogHref(basePath, next)}
                className="rounded-full bg-sand px-3 py-1 text-xs font-bold"
              >
                {chip.label} ×
              </Link>
            )
          })}
          <Link href={basePath} className="rounded-full px-3 py-1 text-xs font-bold text-coral">
            Clear all
          </Link>
        </div>
      ) : null}
    </div>
  )
}

export function ShopSort({ basePath, query }: { basePath: string; query: CatalogQuery }) {
  const router = useRouter()

  return (
    <form
      action={basePath}
      method="get"
      className="flex items-center gap-2 text-sm"
      onSubmit={(event) => event.preventDefault()}
    >
      {query.q ? <input type="hidden" name="q" value={query.q} /> : null}
      {query.category ? <input type="hidden" name="category" value={query.category} /> : null}
      {query.gender ? <input type="hidden" name="gender" value={query.gender} /> : null}
      {query.age ? <input type="hidden" name="age" value={query.age} /> : null}
      {query.size ? <input type="hidden" name="size" value={query.size} /> : null}
      {query.color ? <input type="hidden" name="color" value={query.color} /> : null}
      {query.heightMin != null ? <input type="hidden" name="heightMin" value={query.heightMin} /> : null}
      {query.heightMax != null ? <input type="hidden" name="heightMax" value={query.heightMax} /> : null}
      {query.max != null ? <input type="hidden" name="max" value={query.max} /> : null}
      {query.inStock ? <input type="hidden" name="inStock" value="1" /> : null}
      <label className="font-semibold text-ink-soft" htmlFor="catalog-sort">
        Sort
      </label>
      <select
        id="catalog-sort"
        name="sort"
        className="rounded-full border border-ink/10 bg-white px-3 py-2 font-semibold"
        defaultValue={query.sort || 'featured'}
        onChange={(event) => {
          router.push(catalogHref(basePath, { ...query, sort: event.target.value as CatalogQuery['sort'], page: 1 }))
        }}
      >
        {SORT_OPTIONS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </form>
  )
}
