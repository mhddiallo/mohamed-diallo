import type { Metadata } from 'next'
import { t, type Locale } from '@/lib/i18n'
import { asMedia, mediaUrl, payload } from '@/lib/payload'
import { RichText } from '@/components/RichText'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return { title: t(locale).about.title }
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  const dict = t(locale)
  const about = await (await payload()).findGlobal({ slug: 'about', locale, depth: 1 })
  const photo = mediaUrl(asMedia(about.photo), 'large')

  return (
    <div className={photo ? 'about-layout' : undefined}>
      {photo && (
        <figure className="about-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt={asMedia(about.photo)?.alt || ''} />
        </figure>
      )}

      <div className="about-main">
        <section className="page-head">
          <h1>{dict.about.title}</h1>
          {about.headline && <p className="lede">{about.headline}</p>}
        </section>

        <RichText data={about.content} />

        {about.timeline && about.timeline.length > 0 && (
          <section className="section">
            <h2>{dict.about.timeline}</h2>
            <ol className="timeline">
              {about.timeline.map((step) => (
                <li key={step.id}>
                  <span className="period">{step.period}</span>
                  <div>
                    <h3>{step.title}</h3>
                    {step.description && <p>{step.description}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  )
}
