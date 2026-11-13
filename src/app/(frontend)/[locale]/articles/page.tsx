import type { Metadata } from 'next'
import Link from 'next/link'
import type { Where } from 'payload'
import { href, t, type Locale } from '@/lib/i18n'
import { payload, published } from '@/lib/payload'
import { ArticleCard } from '@/components/Cards'

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
  const where: Where = active
    ? { and: [published, { theme: { equals: active.id } }] }
    : published
  const articles = await p.find({
    collection: 'articles',
    locale,
    where,
    sort: '-publishedAt',
    limit: 100,
    depth: 1,
  })

  const base = href(locale, 'articles')

  return (
    <>
      <section className="page-head">
        <h1>{dict.articles.title}</h1>
        <p className="lede">{active?.description || dict.articles.intro}</p>
      </section>

      {themes.docs.length > 0 && (
        <nav className="chips" aria-label={dict.articles.title}>
          <Link href={base} aria-current={!active ? 'true' : undefined}>
            {dict.articles.all}
          </Link>
          {themes.docs.map((th) => (
            <Link
              key={th.id}
              href={`${base}?theme=${th.slug}`}
              aria-current={active?.id === th.id ? 'true' : undefined}
            >
              {th.name}
            </Link>
          ))}
        </nav>
      )}

      {articles.docs.length === 0 ? (
        <p className="empty">{dict.articles.empty}</p>
      ) : (
        <div className="grid">
          {articles.docs.map((a) => (
            <ArticleCard key={a.id} article={a} locale={locale} />
          ))}
        </div>
      )}
    </>
  )
}
