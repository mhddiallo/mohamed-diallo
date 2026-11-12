import Link from 'next/link'
import type { Locale } from '@/lib/i18n'
import { href, t } from '@/lib/i18n'
import { payload } from '@/lib/payload'
import { getPlaces } from '@/lib/places'
import { ArticleCard, NoteItem } from '@/components/Cards'
import { MiniMap } from '@/components/MiniMap'

export const dynamic = 'force-dynamic'

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const dict = t(locale)
  const p = await payload()

  const [settings, articles, notes, places] = await Promise.all([
    p.findGlobal({ slug: 'settings', locale }),
    p.find({ collection: 'articles', locale, limit: 3, sort: '-publishedAt', depth: 1 }),
    p.find({ collection: 'notes', locale, limit: 3, sort: '-publishedAt' }),
    getPlaces(locale),
  ])

  const countries = new Set(places.map((d) => d.country)).size
  const cities = new Set(places.map((d) => `${d.country}-${d.city}`)).size
  const name = settings.siteName || 'Mohamed Diallo'
  const [first, ...rest] = name.split(' ')

  return (
    <>
      <section className="hero">
        <div className="hero-name">
          {settings.kicker && <span className="kicker">{settings.kicker}</span>}
          <h1>
            {first}
            {rest.length > 0 && (
              <>
                <br />
                {rest.join(' ')}
              </>
            )}
          </h1>
        </div>
        <div className="hero-text">
          {settings.tagline && <p className="statement">{settings.tagline}</p>}
          {settings.intro && <p className="intro">{settings.intro}</p>}
          <Link href={href(locale, 'about')} className="arrow-link">
            {dict.home.myPath} →
          </Link>
        </div>
      </section>

      {places.length > 0 && (
        <section className="map-banner">
          <div className="map-banner-text">
            <span className="label">{dict.home.mapLabel}</span>
            <h2>{dict.home.mapTitle(countries, cities)}</h2>
            <Link href={href(locale, 'map')} className="button-light">
              {dict.home.exploreMap} →
            </Link>
          </div>
          <div className="map-banner-map" aria-hidden>
            <MiniMap places={places} />
          </div>
        </section>
      )}

      {articles.docs.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>{dict.home.latestArticles}</h2>
            <Link href={href(locale, 'articles')} className="arrow-link">
              {dict.home.allArticles} →
            </Link>
          </div>
          <div className="grid">
            {articles.docs.map((a) => (
              <ArticleCard key={a.id} article={a} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {notes.docs.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>{dict.home.latestNotes}</h2>
            <Link href={href(locale, 'notes')} className="arrow-link">
              {dict.home.allNotes} →
            </Link>
          </div>
          <div className="notes-grid">
            {notes.docs.map((n) => (
              <NoteItem key={n.id} note={n} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
