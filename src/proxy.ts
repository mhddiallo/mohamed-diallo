import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { defaultLocale, isLocale, routeKeyFromSegment } from './lib/i18n'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // "/" -> English by default; visitors can switch to French with the FR/EN toggle
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url))
  }

  // Translated URLs: /fr/a-propos -> internal route /fr/about
  const [, locale, segment, ...rest] = pathname.split('/')
  if (locale && isLocale(locale) && segment) {
    const key = routeKeyFromSegment(locale, segment)
    if (key && key !== segment) {
      const url = request.nextUrl.clone()
      url.pathname = ['', locale, key, ...rest].join('/')
      return NextResponse.rewrite(url)
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|admin|_next|media|.*\\..*).*)'],
}
