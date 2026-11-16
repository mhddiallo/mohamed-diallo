import type { Metadata } from 'next'
import { EmptyState } from '@/components/EmptyState'
import Link from 'next/link'
import type { Where } from 'payload'
import { href, t, type Locale } from '@/lib/i18n'
import { payload, published } from '@/lib/payload'
import { ArticleCard } from '@/components/Cards'
import { ThemeIcon } from '@/lib/themeIcons'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ theme?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return { title: t(locale).articles.title }
}

export default async function ArticlesPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { theme: themeSlug } = await searchParams
  const dict = t(locale)
  const p = await payload()

  const themes = await p.find({ collection: 'themes', locale, limit: 100, sort: 'order' })
  const active = themes.docs.find((th) => th.slug === themeSlug)
  const where: Where = active ? { and: [published, { theme: { equals: active.id } }] } : published
  const articles = await p.find({
    collection: 'articles',
    locale,
    where,
    sort: '-publishedAt',
    limit: 100,
    depth: 1,
  })

  // Article count per theme, for the sidebar
  const total = await p.find({ collection: 'articles', where: published, limit: 0, depth: 0 })
  const all = await p.find({
    collection: 'articles',
    where: published,
    limit: 1000,
    depth: 0,
    select: { theme: true },
  })
  const counts = new Map<number, number>()
  for (const a of all.docs) {
    const id = typeof a.theme === 'object' ? a.theme?.id : a.theme
    if (id) counts.set(id, (counts.get(id) ?? 0) + 1)
  }

  const base = href(locale, 'articles')

  return (
    <>
      <section className="page-head">
        <h1>{dict.articles.title}</h1>
        <p className="lede">{dict.articles.intro}</p>
      </section>

      <div className={themes.docs.length > 0 ? 'articles-layout' : undefined}>
        {themes.docs.length > 0 && (
          <nav className="theme-nav" aria-label={dict.articles.themes}>
            <p className="theme-nav-title">{dict.articles.themes}</p>
            <Link href={base} aria-current={!active ? 'page' : undefined} scroll={false}>
              <ThemeIcon name="layers" />
              <span>{dict.articles.all}</span>
              <span className="theme-count">{total.totalDocs}</span>
            </Link>
            {themes.docs.map((th) => (
              <Link
                key={th.id}
                href={`${base}?theme=${th.slug}`}
                aria-current={active?.id === th.id ? 'page' : undefined}
                scroll={false}
              >
                <ThemeIcon name={th.icon} />
                <span>{th.name}</span>
                <span className="theme-count">{counts.get(th.id) ?? 0}</span>
              </Link>
            ))}
          </nav>
        )}

        <div className="articles-main">
          {active && (
            <header className="theme-head">
              <span className="theme-head-icon">
                <ThemeIcon name={active.icon} size={22} />
              </span>
              <div>
                <h2>{active.name}</h2>
                {active.description && <p>{active.description}</p>}
              </div>
            </header>
          )}
          {articles.docs.length === 0 ? (
            active ? (
              <p className="empty">{dict.articles.emptyTheme}</p>
            ) : (
              <EmptyState
                locale={locale}
                icon="✍️"
                title={dict.articles.emptyTitle}
                text={dict.articles.emptyText}
              />
            )
          ) : (
            <div className="grid">
              {articles.docs.map((a) => (
                <ArticleCard key={a.id} article={a} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
