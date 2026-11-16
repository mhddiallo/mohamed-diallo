import Link from 'next/link'
import { href, t, type Locale, type RouteKey } from '@/lib/i18n'

type Props = {
  locale: Locale
  icon: string
  title: string
  text: string
  /** Other sections to suggest while this one is empty */
  links?: RouteKey[]
}

/** Full-width placeholder for sections that have no content yet. */
export function EmptyState({
  locale,
  icon,
  title,
  text,
  links = ['map', 'interests', 'about'],
}: Props) {
  const dict = t(locale)
  return (
    <section className="empty-state">
      <div className="empty-state-icon" aria-hidden>
        {icon}
      </div>
      <p className="empty-state-kicker">{dict.emptyState.soon}</p>
      <h2>{title}</h2>
      <p className="empty-state-text">{text}</p>
      <p className="empty-state-meanwhile">{dict.emptyState.meanwhile}</p>
      <nav className="empty-state-links">
        {links.map((key) => (
          <Link key={key} href={href(locale, key)}>
            {dict.nav[key as keyof typeof dict.nav]} <span aria-hidden>→</span>
          </Link>
        ))}
      </nav>
    </section>
  )
}
