import Link from 'next/link'
import type { Goal, Interest, Theme } from '@/payload-types'
import type { Locale } from '@/lib/i18n'
import { formatDate, href, t } from '@/lib/i18n'
import { asMedia, mediaUrl, payload, published } from '@/lib/payload'
import { getPlaces } from '@/lib/places'
import { RichText } from '@/components/RichText'
import { MiniMap } from '@/components/MiniMap'
import { CountUp } from '@/components/motion/CountUp'
import { FloatingDots } from '@/components/motion/FloatingDots'
import { Interpolate, SplitLetters } from '@/components/motion/Interpolate'

export const dynamic = 'force-dynamic'

const goalPct = (g: Goal) =>
  g.status === 'achieved'
    ? 100
    : typeof g.target === 'number' && g.target > 0
      ? Math.min(100, ((g.current ?? 0) / g.target) * 100)
      : 0

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const dict = t(locale)
  const p = await payload()
  const year = new Date().getFullYear()

  const [settings, about, articles, notes, places, interests, goals, themes] = await Promise.all([
    p.findGlobal({ slug: 'settings', locale }),
    p.findGlobal({ slug: 'about', locale, depth: 1 }),
    p.find({
      collection: 'articles',
      locale,
      where: published,
      limit: 1,
      sort: '-publishedAt',
      depth: 1,
    }),
    p.find({ collection: 'notes', locale, where: published, limit: 1, sort: '-publishedAt' }),
    getPlaces(locale),
    p.find({ collection: 'interests', locale, limit: 12, sort: '-date', depth: 1 }),
    p.find({ collection: 'goals', locale, where: { year: { equals: year } }, limit: 100, depth: 1 }),
    p.find({ collection: 'themes', locale, limit: 20, sort: 'order' }),
  ])

  const name = settings.siteName || 'Mohamed Diallo'
  const [first, ...rest] = name.split(' ')
  const photo = mediaUrl(asMedia(about.photo), 'large')

  // Map figures
  const countries = new Set(places.map((d) => d.country)).size
  const cities = new Set(places.map((d) => `${d.country}-${d.city}`)).size
  const continents = new Set(places.map((d) => d.continent).filter(Boolean)).size
  const dated = places.filter((p): p is typeof p & { year: number } => p.year !== null)
  const lastTrip = [...dated].sort((a, b) => b.year - a.year)[0]

  // "Right now"
  const reading = interests.docs.find((i) => i.kind === 'book' && i.status === 'current')
  const activeGoals = goals.docs.filter((g) => g.status === 'in_progress')
  const focusGoal = [...activeGoals].sort((a, b) => goalPct(b) - goalPct(a))[0]

  // Goals ring
  const achieved = goals.docs.filter((g) => g.status === 'achieved').length
  const total = goals.docs.filter((g) => g.status !== 'dropped').length
  const ring = total ? achieved / total : 0
  const topGoals = [...activeGoals].sort((a, b) => goalPct(b) - goalPct(a)).slice(0, 3)

  // Shelf: latest covers (books, films, series)
  const shelf = interests.docs
    .filter((i): i is Interest => i.kind !== 'activity' && !!asMedia(i.cover))
    .slice(0, 6)

  // Travels timeline (most recent first)
  const byYear = new Map<number, string[]>()
  for (const pl of [...dated].sort((a, b) => b.year - a.year)) {
    const list = byYear.get(pl.year) ?? []
    if (!list.includes(pl.city)) list.push(pl.city)
    byYear.set(pl.year, list)
  }

  const article = articles.docs[0]
  const articleTheme = article && typeof article.theme === 'object' ? (article.theme as Theme) : null
  const articleCover = article ? mediaUrl(asMedia(article.cover), 'card') : null
  const note = notes.docs[0]

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className={photo ? 'hero hero-photo' : 'hero'}>
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
          <div className="hero-text">
            {settings.tagline && <p className="statement">{settings.tagline}</p>}
            {settings.intro && <p className="intro">{settings.intro}</p>}
            <Link href={href(locale, 'about')} className="arrow-link">
              {dict.home.myPath} →
            </Link>
          </div>
        </div>
        {photo && (
          <figure className="about-photo hero-portrait">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt={asMedia(about.photo)?.alt || name} />
          </figure>
        )}
      </section>

      {/* ---------- Manifesto ---------- */}
      {settings.manifesto && (
        <section className="manifesto">
          <p>{settings.manifesto}</p>
        </section>
      )}

      {/* ---------- Bento ---------- */}
      <section className="bento">
        {/* Right now */}
        <article className="tile tile-now">
          <span className="tile-label">{dict.home.now}</span>
          <ul className="now-list">
            {reading && (
              <li>
                {asMedia(reading.cover) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(asMedia(reading.cover), 'thumbnail') || ''} alt="" />
                ) : (
                  <span className="now-icon" aria-hidden>
                    📖
                  </span>
                )}
                <div>
                  <small>{dict.home.reading}</small>
                  <strong>{reading.title}</strong>
                  {reading.creator && <span>{reading.creator}</span>}
                </div>
              </li>
            )}
            {focusGoal && (
              <li>
                <span className="now-icon now-ring" aria-hidden>
                  {Math.round(goalPct(focusGoal))}%
                </span>
                <div>
                  <small>{dict.home.focus}</small>
                  <strong>{focusGoal.title}</strong>
                  {typeof focusGoal.target === 'number' && (
                    <span>
                      {focusGoal.current ?? 0} / {focusGoal.target}
                    </span>
                  )}
                </div>
              </li>
            )}
            {lastTrip && (
              <li>
                <span className="now-icon" aria-hidden>
                  ✈︎
                </span>
                <div>
                  <small>{dict.home.lastTrip}</small>
                  <strong>
                    {lastTrip.city}, {lastTrip.countryName}
                  </strong>
                  <span>{lastTrip.year}</span>
                </div>
              </li>
            )}
          </ul>
        </article>

        {/* Map */}
        {places.length > 0 && (
          <article className="tile tile-map map-banner">
            <FloatingDots
              count={26}
              seed={29}
              colors={['var(--ocre)', 'var(--sable)']}
              className="on-dark"
            />
            <div className="map-banner-text">
              <span className="label">{dict.home.mapLabel}</span>
              <div className="map-stats">
                <div>
                  <strong>
                    <CountUp value={countries} />
                  </strong>
                  <span>{dict.map.countries}</span>
                </div>
                <div>
                  <strong>
                    <CountUp value={cities} />
                  </strong>
                  <span>{dict.map.cities}</span>
                </div>
                <div>
                  <strong>
                    <CountUp value={continents} />
                  </strong>
                  <span>{dict.map.continents}</span>
                </div>
              </div>
              <Link href={href(locale, 'map')} className="button-light">
                {dict.home.exploreMap} →
              </Link>
            </div>
            <div className="map-banner-map" aria-hidden>
              <MiniMap places={places} />
            </div>
          </article>
        )}

        {/* Goals */}
        {goals.docs.length > 0 && (
          <article className="tile tile-goals">
            <span className="tile-label">
              <Interpolate text={dict.home.goalsOf} values={{ year }} />
            </span>
            <div className="goals-ring">
              <svg viewBox="0 0 120 120" aria-hidden>
                <circle cx="60" cy="60" r="50" className="ring-track" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className="ring-value"
                  style={{ ['--ring' as string]: ring }}
                />
              </svg>
              <div className="ring-label">
                <strong>
                  <CountUp value={achieved} />
                  <small>/{total}</small>
                </strong>
                <span>{dict.home.achieved}</span>
              </div>
            </div>
            <ul className="mini-goals">
              {topGoals.map((g) => (
                <li key={g.id} className="goal">
                  <span>{g.title}</span>
                  <div className="bar bar-baobab">
                    <span style={{ width: `${goalPct(g)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <Link href={href(locale, 'goals')} className="arrow-link">
              {dict.home.allGoals} →
            </Link>
          </article>
        )}

        {/* Latest article */}
        {article && (
          <article className="tile tile-article card">
            {articleCover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={articleCover} alt="" className="card-cover" />
            ) : (
              <div className="card-cover placeholder" aria-hidden />
            )}
            <div className="card-body">
              <span className="tile-label">{dict.home.latestArticle}</span>
              <p className="meta">
                {articleTheme && <span className="tag">{articleTheme.name}</span>}
                <time dateTime={article.publishedAt || undefined}>
                  {formatDate(article.publishedAt, locale)}
                </time>
              </p>
              <h3>
                <Link
                  href={href(locale, 'articles', article.slug || String(article.id))}
                  className="stretched"
                >
                  {article.title}
                </Link>
              </h3>
              {article.excerpt && <p className="excerpt">{article.excerpt}</p>}
            </div>
          </article>
        )}

        {/* Latest note */}
        {note && (
          <article className="tile tile-note">
            <span className="tile-label">{dict.home.latestNote}</span>
            <span className="quote-mark" aria-hidden>
              “
            </span>
            <RichText data={note.content} className="prose note-quote" />
            <Link href={href(locale, 'notes')} className="arrow-link">
              {dict.home.allNotes} →
            </Link>
          </article>
        )}

        {/* Shelf */}
        {shelf.length > 0 && (
          <article className="tile tile-shelf">
            <span className="tile-label">{dict.home.shelf}</span>
            <ul className="shelf">
              {shelf.map((item) => (
                <li key={item.id} title={item.title}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaUrl(asMedia(item.cover), 'thumbnail') || ''} alt={item.title} />
                </li>
              ))}
            </ul>
            <Link href={href(locale, 'interests')} className="arrow-link">
              {dict.home.allInterests} →
            </Link>
          </article>
        )}

        {/* Themes */}
        {themes.docs.length > 0 && (
          <article className="tile tile-themes">
            <span className="tile-label">{dict.home.themes}</span>
            <div className="theme-chips">
              {themes.docs.map((th) => (
                <Link key={th.id} href={`${href(locale, 'articles')}?theme=${th.slug}`}>
                  {th.name}
                </Link>
              ))}
            </div>
          </article>
        )}
      </section>

      {/* ---------- Travels timeline ---------- */}
      {byYear.size > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>{dict.home.travels}</h2>
            <Link href={href(locale, 'map')} className="arrow-link">
              {dict.home.exploreMap} →
            </Link>
          </div>
          <ol className="travel-strip">
            {[...byYear.entries()].map(([y, list]) => (
              <li key={y}>
                <span className="strip-year">{y}</span>
                <span className="strip-dot" aria-hidden />
                <span className="strip-cities">{list.join(' · ')}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ---------- Contact ---------- */}
      <section className="contact-cta">
        <h2>{dict.home.contactTitle}</h2>
        <p>{dict.home.contactText}</p>
        {settings.socials && settings.socials.length > 0 && (
          <div className="contact-links">
            {settings.socials.map((s) => (
              <a
                key={s.id}
                href={s.url}
                rel="me noopener"
                target={s.url.startsWith('http') ? '_blank' : undefined}
              >
                {s.label} →
              </a>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
