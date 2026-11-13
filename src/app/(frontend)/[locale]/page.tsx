import Link from 'next/link'
import type { Locale } from '@/lib/i18n'
import { href, t } from '@/lib/i18n'
import { payload } from '@/lib/payload'
import { getPlaces } from '@/lib/places'
import { ArticleCard, NoteItem } from '@/components/Cards'
import { MiniMap } from '@/components/MiniMap'
import { CountUp } from '@/components/motion/CountUp'
import { FloatingDots } from '@/components/motion/FloatingDots'
import { Interpolate, SplitLetters } from '@/components/motion/Interpolate'

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
          <h1 className="hero-title">
            <SplitLetters text={first} />
            {rest.length > 0 && (
              <>
                <br />
                <SplitLetters text={rest.join(' ')} offset={first.length} />
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
          <FloatingDots
            count={26}
            seed={29}
            colors={['var(--ocre)', 'var(--sable)']}
            className="on-dark"
          />
          <div className="map-banner-text">
            <span className="label">{dict.home.mapLabel}</span>
            <h2>
              <Interpolate
                text={dict.home.mapTitle}
                values={{ countries: <CountUp value={countries} />, cities: <CountUp value={cities} /> }}
              />
            </h2>
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
