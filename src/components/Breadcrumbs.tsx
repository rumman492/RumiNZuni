import Link from 'next/link'
import { JsonLd } from '@/components/JsonLd'
import { breadcrumbJsonLd, type BreadcrumbItem } from '@/lib/seo'

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(items)} />
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-ink-soft">
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((item, index) => {
            const last = index === items.length - 1
            return (
              <li key={`${item.href}-${item.name}`} className="flex items-center gap-2">
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {last ? (
                  <span className="font-semibold text-ink">{item.name}</span>
                ) : (
                  <Link href={item.href} className="hover:text-coral">
                    {item.name}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
