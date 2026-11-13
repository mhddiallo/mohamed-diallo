import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { formatDate, href, t, type Locale } from '@/lib/i18n'
import { asMedia, mediaUrl, payload } from '@/lib/payload'

export const dynamic = 'force-dynamic'

type Tab = 'book' | 'screen' | 'activity'
const tabs: Tab[] = ['book', 'screen', 'activity']
const kindsForTab: Record<Tab, string[]> = {
  book: ['book'],
  screen: ['film', 'series'],
  activity: ['activity'],
}

type Props = {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ tab?: string; year?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return { title: t(locale).interests.title }
}

export default async function InterestsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { tab: tabParam, year: yearParam } = await searchParams
  const tab: Tab = tabs.includes(tabParam as Tab) ? (tabParam as Tab) : 'book'
  const dict = t(locale)

  const items = await (await payload()).find({
    collection: 'interests',
    locale,
    where: { kind: { in: kindsForTab[tab] } },
    sort: '-date',
    limit: 300,
    depth: 1,
  })

  // Group by the year the item was read/watched. "Up next" goes last.
  const groupOf = (item: (typeof items.docs)[number]): string =>
    item.status === 'wishlist' ? 'wishlist' : item.date ? String(new Date(item.date).getUTCFullYear()) : 'undated'
  const rank = (key: string) => (key === 'wishlist' ? -2 : key === 'undated' ? -1 : Number(key))

  const groups = new Map<string, typeof items.docs>()
  for (const item of items.docs) {
    const key = groupOf(item)
    groups.set(key, [...(groups.get(key) ?? []), item])
  }
  for (const list of groups.values()) {
    // In progress first, then by date (already sorted -date)
    list.sort((a, b) => Number(b.status === 'current') - Number(a.status === 'current'))
  }
  const keys = [...groups.keys()].sort((a, b) => rank(b) - rank(a))
  const years = keys.filter((k) => /^\d{4}$/.test(k))
  const year = yearParam && groups.has(yearParam) ? yearParam : undefined
  const shown = year ? [year] : keys
  const base = href(locale, 'interests')
  const groupLabel = (key: string) =>
    key === 'wishlist' ? dict.interests.status.wishlist : key === 'undated' ? dict.interests.undated : key

  return (
    <>
      <section className="page-head">
        <h1>{dict.interests.title}</h1>
        <p className="lede">{dict.interests.intro}</p>
      </section>

      <nav className="chips" aria-label={dict.interests.title}>
        {tabs.map((key) => (
          <Link key={key} href={`${base}?tab=${key}`} aria-current={tab === key ? 'true' : undefined}>
            {dict.interests.tabs[key]}
          </Link>
        ))}
      </nav>

      {years.length > 1 && (
        <nav className="chips year-filter" aria-label={dict.interests.filterByYear}>
          <Link href={`${base}?tab=${tab}`} aria-current={!year ? 'true' : undefined} scroll={false}>
            {dict.interests.allYears}
          </Link>
          {years.map((y) => (
            <Link key={y} href={`${base}?tab=${tab}&year=${y}`} aria-current={year === y ? 'true' : undefined} scroll={false}>
              {y}
              <span className="chip-count">{groups.get(y)!.length}</span>
            </Link>
          ))}
        </nav>
      )}

      {items.docs.length === 0 ? (
        <p className="empty">{dict.interests.empty}</p>
      ) : (
        shown.map((key) => (
          <section key={key} className="interest-year" aria-labelledby={`y-${key}`}>
            <h2 className="interest-year-head" id={`y-${key}`}>
              <span>{groupLabel(key)}</span>
              <span className="interest-year-count">{groups.get(key)!.length}</span>
            </h2>
            <ul className="interest-list">
              {groups.get(key)!.map((item) => {
                const cover = mediaUrl(asMedia(item.cover), 'thumbnail')
                return (
                  <li key={item.id} className="interest">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt="" className="interest-cover" loading="lazy" />
                    ) : (
                      <div className="interest-cover placeholder" aria-hidden>
                        {item.kind === 'book' ? '📖' : item.kind === 'activity' ? '✦' : '🎬'}
                      </div>
                    )}
                    <div className="interest-body">
                      <p className="meta">
                        <span className={`pill pill-${item.status}`}>
                          {dict.interests.status[item.status]}
                        </span>
                        {tab === 'screen' && <span className="tag">{dict.interests.kinds[item.kind]}</span>}
                        {item.date && <span>{formatDate(item.date, locale, groupOf(item) === 'wishlist' ? { month: 'long', year: 'numeric' } : { month: 'long' })}</span>}
                      </p>
                      <h3>
                        {item.link ? (
                          <a href={item.link} target="_blank" rel="noopener">
                            {item.title}
                          </a>
                        ) : (
                          item.title
                        )}
                      </h3>
                      {(item.creator || item.releaseYear) && (
                        <p className="creator">
                          {[item.creator, item.releaseYear].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      {item.rating ? (
                        <p className="rating" aria-label={`${item.rating}/5`}>
                          <span className="stars" style={{ '--fill': `${(item.rating / 5) * 100}%` } as CSSProperties}>
                            ★★★★★
                          </span>
                          <span className="rating-value">{item.rating.toLocaleString(locale)}</span>
                        </p>
                      ) : null}
                      {item.comment && <p className="comment">{item.comment}</p>}
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        ))
      )}
    </>
  )
}
