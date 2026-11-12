'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  href,
  locales,
  otherLocale,
  routeKeyFromSegment,
  routes,
  type Locale,
  type RouteKey,
} from '@/lib/i18n'
import { useAltLink } from './AltLink'

/** FR | EN segmented toggle that keeps the visitor on the equivalent page. */
export function LanguageSwitcher({ locale, title }: { locale: Locale; title: string }) {
  const pathname = usePathname() || `/${locale}`
  const { alt } = useAltLink()
  const target = otherLocale(locale)

  let to = `/${target}`
  if (alt) {
    to = alt
  } else {
    const [, , segment] = pathname.split('/')
    if (segment) {
      const key =
        routeKeyFromSegment(locale, segment) ??
        (segment in routes ? (segment as RouteKey) : undefined)
      if (key) to = href(target, key)
    }
  }

  return (
    <div className="lang-toggle" role="group" aria-label={title}>
      {locales.map((l) =>
        l === locale ? (
          <span key={l} className="active" aria-current="true" lang={l}>
            {l.toUpperCase()}
          </span>
        ) : (
          <Link key={l} href={to} hrefLang={l} lang={l} title={title}>
            {l.toUpperCase()}
          </Link>
        ),
      )}
    </div>
  )
}
