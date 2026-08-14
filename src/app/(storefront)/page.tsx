import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import {
  homepageBanner,
  homepageCollections,
  homepageFeaturedCards,
  homepageFeaturedCopy,
  homepageHero,
  homepagePromos,
  homepageStory,
  type HomepageSettings,
} from '@/lib/homepage'
import { collectionTheme } from '@/lib/play'
import { getSettings } from '@/lib/products'
import { pageMeta } from '@/lib/seo'
import { absoluteMediaUrl, STORE_NAME } from '@/lib/site'

const PLAY_TICKER = ['Play all day', 'Soft cotton', 'Cash on delivery', 'Ages newborn – 12', 'Boys · Girls']

export async function generateMetadata(): Promise<Metadata> {
  let storeName = STORE_NAME
  let homepage: HomepageSettings | null = null
  try {
    const settings = await getSettings()
    storeName = settings.storeName || storeName
    homepage = settings as HomepageSettings
  } catch {
    homepage = null
  }
  const hero = homepageHero(homepage)
  const title = `${storeName} — ${hero.title}`
  return {
    ...pageMeta({
      title,
      description: hero.subtitle,
      path: '/',
      image: hero.image ? absoluteMediaUrl(hero.image) : null,
    }),
    title: { absolute: title },
  }
}

export default async function HomePage() {
  let settings: HomepageSettings | null = null
  try {
    settings = (await getSettings()) as HomepageSettings
  } catch {
    settings = null
  }

  let cards: Awaited<ReturnType<typeof homepageFeaturedCards>> = []
  try {
    cards = await homepageFeaturedCards(settings)
  } catch {
    cards = []
  }

  let hero = homepageHero(null)
  let banner = homepageBanner(null)
  let collections = homepageCollections(null)
  let featured = homepageFeaturedCopy(null)
  let promos = homepagePromos(null)
  let story = homepageStory(null)
  try {
    hero = homepageHero(settings)
    banner = homepageBanner(settings)
    collections = homepageCollections(settings)
    featured = homepageFeaturedCopy(settings)
    promos = homepagePromos(settings)
    story = homepageStory(settings)
  } catch {
    hero = homepageHero(null)
    banner = null
    collections = homepageCollections(null)
    featured = homepageFeaturedCopy(null)
    promos = homepagePromos(null)
    story = null
  }

  const ticker = [...PLAY_TICKER, ...PLAY_TICKER]

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-[2.5rem] bg-sand px-6 py-12 md:grid md:grid-cols-2 md:items-center md:gap-10 md:px-12">
        <div className="play-blob absolute -left-10 -top-12 h-36 w-36 rounded-full bg-blush/50" />
        <div className="play-blob absolute -right-8 top-10 h-28 w-28 rounded-full bg-sky/60" style={{ animationDelay: '1.2s' }} />
        <div className="play-blob absolute bottom-6 left-1/3 h-20 w-20 rounded-full bg-lemon/70" style={{ animationDelay: '2s' }} />
        <div className="relative">
          <p className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-bold uppercase tracking-[0.16em] text-coral">
            {hero.eyebrow}
          </p>
          <h1 className="display mt-4 text-4xl leading-tight md:text-6xl">{hero.title}</h1>
          <p className="mt-4 max-w-lg text-lg text-ink-soft">{hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={hero.ctaLink} className="play-pop rounded-full bg-coral px-6 py-3 text-sm font-bold text-white shadow-sm">
              {hero.cta}
            </Link>
            {hero.secondaryCta ? (
              <Link
                href={hero.secondaryCtaLink}
                className="play-pop rounded-full bg-white px-6 py-3 text-sm font-bold shadow-sm"
              >
                {hero.secondaryCta}
              </Link>
            ) : null}
          </div>
        </div>
        {hero.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hero.image}
            alt={hero.title}
            className="relative mt-8 aspect-square w-full rounded-[2rem] object-cover shadow-lg md:mt-0"
          />
        ) : (
          <div className="relative mt-8 grid aspect-square place-items-center rounded-[2rem] bg-white text-center shadow-lg md:mt-0">
            <div>
              <Sparkles className="play-float mx-auto h-10 w-10 text-gold" />
              <p className="display mt-4 text-3xl">{hero.overlayTitle}</p>
              <p className="mt-2 text-ink-soft">{hero.overlaySubtitle}</p>
            </div>
          </div>
        )}
      </section>

      <div className="play-marquee rounded-full bg-ink py-3 text-sm font-bold text-cream">
        <div className="play-marquee-track gap-10 px-6">
          {ticker.map((item, index) => (
            <span key={`${item}-${index}`} className="flex items-center gap-10 whitespace-nowrap">
              {item}
              <span className="text-lemon" aria-hidden>
                ★
              </span>
            </span>
          ))}
        </div>
      </div>

      {banner ? (
        <section className="flex flex-col items-start justify-between gap-4 rounded-[2rem] bg-coral px-6 py-8 text-white md:flex-row md:items-center md:px-10">
          <div>
            <h2 className="display text-3xl">{banner.title}</h2>
            {banner.copy ? <p className="mt-2 max-w-xl text-sm text-white/90">{banner.copy}</p> : null}
          </div>
          {banner.cta ? (
            <Link href={banner.ctaLink} className="play-pop rounded-full bg-lemon px-6 py-3 text-sm font-bold text-ink">
              {banner.cta}
            </Link>
          ) : null}
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {collections.map((item) => (
          <Link
            key={`${item.href}-${item.title}`}
            href={item.href}
            className={`play-pop overflow-hidden rounded-3xl ${collectionTheme(item.title, item.href)} shadow-sm`}
          >
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image} alt={item.title} className="aspect-[4/3] w-full object-cover" />
            ) : null}
            <div className="p-6">
              <h2 className="display text-3xl">{item.title}</h2>
              {item.copy ? <p className="mt-2 text-sm text-ink/80">{item.copy}</p> : null}
              <p className="mt-4 text-sm font-bold">Shop now →</p>
            </div>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-coral">{featured.eyebrow}</p>
            <h2 className="display text-4xl">{featured.heading}</h2>
          </div>
          <Link href={featured.ctaLink} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-coral shadow-sm">
            {featured.cta}
          </Link>
        </div>
        {cards.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-ink-soft shadow-sm">{featured.emptyMessage}</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((product) => (
              <ProductCard key={product.slug} {...product} />
            ))}
          </div>
        )}
      </section>

      {story ? (
        <section className="grid items-center gap-8 rounded-[2rem] bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">
          {story.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={story.image} alt={story.title} className="aspect-[4/5] w-full rounded-[1.5rem] object-cover" />
          ) : null}
          <div className={story.image ? '' : 'md:col-span-2'}>
            {story.eyebrow ? (
              <p className="text-sm font-bold uppercase tracking-wide text-coral">{story.eyebrow}</p>
            ) : null}
            <h2 className="display mt-2 text-4xl">{story.title}</h2>
            {story.body ? (
              <p className="mt-4 max-w-xl whitespace-pre-line text-ink-soft">{story.body}</p>
            ) : null}
            {story.cta ? (
              <Link
                href={story.ctaLink}
                className="play-pop mt-6 inline-flex rounded-full bg-coral px-6 py-3 text-sm font-bold text-white"
              >
                {story.cta}
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        {promos.map((item, index) => {
          const tones = ['bg-sky', 'bg-lemon', 'bg-mint']
          return (
            <div key={item.title} className={`play-pop rounded-[2rem] p-6 ${tones[index % tones.length]}`}>
              <item.Icon className="h-7 w-7" />
              <h3 className="mt-3 font-bold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/80">{item.copy}</p>
            </div>
          )
        })}
      </section>
    </div>
  )
}
