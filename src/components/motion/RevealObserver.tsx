'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/** Elements that fade/slide in when they scroll into view. */
export const REVEAL_SELECTOR = [
  '.page-head',
  '.section-head',
  '.section-title',
  '.map-banner',
  '.tile',
  '.manifesto',
  '.travel-strip li',
  '.contact-cta',
  '.card',
  '.note',
  '.timeline li',
  '.year-card',
  '.goal-summary',
  '.goal-group',
  '.goal',
  '.interest',
  '.stat-card',
  '.about-photo',
  '.prose > *',
].join(',')

/**
 * Adds `is-visible` to elements as they enter the viewport. Siblings get a
 * small stagger so lists cascade in. Styles live in styles.css (html.anim).
 */
export function RevealObserver() {
  const pathname = usePathname()

  useEffect(() => {
    const root = document.documentElement
    if (!root.classList.contains('anim')) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )

    // Tracked per effect run (React may run effects twice in development)
    const seen = new WeakSet<Element>()
    const bind = () => {
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((el) => {
        if (seen.has(el) || el.classList.contains('is-visible')) return
        seen.add(el)
        const siblings = el.parentElement ? [...el.parentElement.children] : []
        const index = Math.max(0, siblings.indexOf(el))
        el.style.setProperty('--reveal-delay', `${Math.min(index, 6) * 70}ms`)
        io.observe(el)
      })
    }

    bind()
    const mo = new MutationObserver(() => bind())
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [pathname])

  return null
}
