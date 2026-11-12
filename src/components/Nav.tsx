'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { href, routeKeyFromSegment, routes, type Locale, type RouteKey } from '@/lib/i18n'

export function Nav({ locale, labels }: { locale: Locale; labels: Record<RouteKey, string> }) {
  const pathname = usePathname() || ''
  const [open, setOpen] = useState(false)
  const segment = pathname.split('/')[2] || ''
  const current =
    routeKeyFromSegment(locale, segment) ?? (segment in routes ? (segment as RouteKey) : null)
  const keys: RouteKey[] = ['about', 'articles', 'map', 'interests', 'goals', 'notes']

  return (
    <nav className="nav" aria-label="Navigation">
      <button
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="nav-list"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (locale === 'fr' ? 'Fermer' : 'Close') : 'Menu'}
      </button>
      <ul id="nav-list" className={open ? 'open' : ''}>
        {keys.map((key) => (
          <li key={key}>
            <Link
              href={href(locale, key)}
              aria-current={current === key ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              {labels[key]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
