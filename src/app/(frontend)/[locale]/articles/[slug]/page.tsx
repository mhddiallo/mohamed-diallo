import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import type { Theme } from '@/payload-types'
import { formatDate, href, otherLocale, t, type Locale } from '@/lib/i18n'
import { asMedia, mediaUrl, payload, published, readingTime } from '@/lib/payload'
import { RichText } from '@/components/RichText'
import { SetAltLink } from '@/components/AltLink'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale; slug: string }> }

const getArticle = cache(async (locale: Locale, slug: string) => {
  const p = await payload()
  const res = await p.find({
    collection: 'articles',
    locale,
    where: { and: [published, { slug: { equals: decodeURIComponent(slug) } }] },
    limit: 1,
    depth: 1,
  })
  return res.docs[0] ?? null
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const article = await getArticle(locale, slug)
  if (!article) return {}
  const cover = mediaUrl(asMedia(article.cover), 'large')
  return {
    title: article.title,
    description: article.excerpt || undefined,
    openGraph: { type: 'article', images: cover ? [cover] : undefined },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params
  const article = await getArticle(locale, slug)
  if (!article) notFound()

  const dict = t(locale)
  const theme = typeof article.theme === 'object' ? (article.theme as Theme) : null
  const cover = asMedia(article.cover)

  // Slug of the same article in the other language, for the language switcher
  const other = otherLocale(locale)
  const translated = await (await payload()).findByID({
    collection: 'articles',
    id: article.id,
    locale: other,
    select: { slug: true },
  })
  const altHref = href(other, 'articles', translated?.slug || article.slug || '')

  return (
    <article className="article">
      <SetAltLink href={altHref} />
      <header className="article-head">
        <Link href={href(locale, 'articles')} className="back">
          ← {dict.articles.back}
        </Link>
        <p className="meta">
          {theme && (
            <Link href={`${href(locale, 'articles')}?theme=${theme.slug}`} className="tag">
              {theme.name}
            </Link>
          )}
          <time dateTime={article.publishedAt || undefined}>
            {formatDate(article.publishedAt, locale)}
          </time>
          <span>· {dict.articles.readingTime(readingTime(article.content))}</span>
        </p>
        <h1>{article.title}</h1>
        {article.excerpt && <p className="lede">{article.excerpt}</p>}
      </header>
      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mediaUrl(cover, 'large') || ''} alt={cover.alt || ''} className="article-cover" />
      )}
      <RichText data={article.content} />
    </article>
  )
}
