import type { Metadata } from 'next'
import { t, type Locale } from '@/lib/i18n'
import { getPlaces } from '@/lib/places'
import { MapExplorer } from '@/components/MapExplorer'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return { title: t(locale).map.title }
}

export default async function MapPage({ params }: Props) {
  const { locale } = await params
  const dict = t(locale)
  const places = await getPlaces(locale)

  if (places.length === 0) {
    return (
      <section className="page-head">
        <h1>{dict.map.title}</h1>
        <p className="empty">{dict.map.empty}</p>
      </section>
    )
  }

  return (
    <MapExplorer
      title={dict.map.title}
      intro={dict.map.intro}
      places={places}
      labels={{
        all: dict.map.all,
        countries: dict.map.countries,
        cities: dict.map.cities,
        continents: dict.map.continents,
        regionNear: dict.map.regionNear,
        regionWorld: dict.map.regionWorld,
        byYear: dict.map.byYear,
      }}
    />
  )
}
