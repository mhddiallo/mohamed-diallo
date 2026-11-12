import type { Metadata } from 'next'
import { t, type Locale } from '@/lib/i18n'
import { payload } from '@/lib/payload'
import { NoteItem } from '@/components/Cards'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return { title: t(locale).notes.title }
}

export default async function NotesPage({ params }: Props) {
  const { locale } = await params
  const dict = t(locale)
  const notes = await (await payload()).find({
    collection: 'notes',
    locale,
    sort: '-publishedAt',
    limit: 200,
  })

  return (
    <>
      <section className="page-head">
        <h1>{dict.notes.title}</h1>
        <p className="lede">{dict.notes.intro}</p>
      </section>
      {notes.docs.length === 0 ? (
        <p className="empty">{dict.notes.empty}</p>
      ) : (
        <div className="notes-list">
          {notes.docs.map((n) => (
            <NoteItem key={n.id} note={n} locale={locale} />
          ))}
        </div>
      )}
    </>
  )
}
