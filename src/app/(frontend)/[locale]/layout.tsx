import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { AltLinkProvider } from '@/components/AltLink'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Nav } from '@/components/Nav'
import { href, isLocale, locales, t } from '@/lib/i18n'
import { payload } from '@/lib/payload'
import '../styles.css'

export const dynamic = 'force-dynamic'

type Props = { children: ReactNode; params: Promise<{ locale: string }> }

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const settings = await (await payload()).findGlobal({ slug: 'settings', locale })
  const name = settings.siteName || 'Mohamed Diallo'
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
    title: { default: name, template: `%s — ${name}` },
    description: settings.tagline || undefined,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])) },
    openGraph: { siteName: name, locale: locale === 'fr' ? 'fr_FR' : 'en_US', type: 'website' },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = t(locale)
  const settings = await (await payload()).findGlobal({ slug: 'settings', locale })
  const name = settings.siteName || 'Mohamed Diallo'

  return (
    <html lang={locale}>
      <body>
        <AltLinkProvider>
          <a className="skip-link" href="#main">
            {locale === 'fr' ? 'Aller au contenu' : 'Skip to content'}
          </a>
          <div className="frame">
            <header className="site-header">
              <Link href={href(locale)} className="brand">
                <span className="monogram" aria-hidden>
                  {initials(name)}
                </span>
                <span className="brand-name">{name}</span>
              </Link>
              <Nav locale={locale} labels={dict.nav} />
              <LanguageSwitcher locale={locale} title={dict.switchLanguageLabel} />
            </header>

            <main id="main">{children}</main>

            <footer className="site-footer">
              <p className="farewell">{settings.footerMessage || dict.footerMessage}</p>
              <div className="footer-links">
                {settings.socials?.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    rel="me noopener"
                    target={s.url.startsWith('http') ? '_blank' : undefined}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
              <p className="copyright">
                © {new Date().getFullYear()} {name}. {dict.footer}
              </p>
            </footer>
          </div>
        </AltLinkProvider>
      </body>
    </html>
  )
}
