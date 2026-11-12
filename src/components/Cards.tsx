import Link from 'next/link'
import type { Article, Note, Theme } from '@/payload-types'
import { formatDate, href, type Locale } from '@/lib/i18n'
import { asMedia, mediaUrl } from '@/lib/payload'
import { RichText } from './RichText'

export function ArticleCard({ article, locale }: { article: Article; locale: Locale }) {
  const theme = typeof article.theme === 'object' ? (article.theme as Theme) : null
  const cover = mediaUrl(asMedia(article.cover), 'card')
  return (
    <article className="card article-card">
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="" className="card-cover" loading="lazy" />
      ) : (
        <div className="card-cover placeholder" aria-hidden />
      )}
      <div className="card-body">
        <p className="meta">
          {theme && <span className="tag">{theme.name}</span>}
          <time dateTime={article.publishedAt || undefined}>
            {formatDate(article.publishedAt, locale, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
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
  )
}

export function NoteItem({ note, locale }: { note: Note; locale: Locale }) {
  return (
    <article className="note" id={`note-${note.id}`}>
      <p className="meta">
        <a href={`${href(locale, 'notes')}#note-${note.id}`}>
          <time dateTime={note.publishedAt || undefined}>
            {formatDate(note.publishedAt, locale, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </time>
        </a>
      </p>
      {note.title && <h3>{note.title}</h3>}
      <RichText data={note.content} />
      {note.tags && note.tags.length > 0 && (
        <p className="note-tags">
          {note.tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </p>
      )}
    </article>
  )
}
