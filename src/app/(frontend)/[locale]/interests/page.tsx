import type { Metadata } from 'next'
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
  searchParams: Promise<{ tab?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return { title: t(locale).interests.title }
}

export default async function InterestsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { tab: tabParam } = await searchParams
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

  // In progress first, then finished, then "up next"
  const order = { current: 0, done: 1, wishlist: 2 } as const
  const docs = [...items.docs].sort((a, b) => order[a.status] - order[b.status])
  const base = href(locale, 'interests')

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

      {docs.length === 0 ? (
        <p className="empty">{dict.interests.empty}</p>
      ) : (
        <ul className="interest-list">
          {docs.map((item) => {
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
                    {item.date && <span>{formatDate(item.date, locale, { month: 'long', year: 'numeric' })}</span>}
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
                      {'★'.repeat(item.rating)}
                      <span className="dim">{'★'.repeat(5 - item.rating)}</span>
                    </p>
                  ) : null}
                  {item.comment && <p className="comment">{item.comment}</p>}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
