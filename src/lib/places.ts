import type { Place } from '@/components/mapTypes'
import { continentOf, countryName, countryNumeric } from './countries'
import type { Locale } from './i18n'
import { payload } from './payload'

export async function getPlaces(locale: Locale): Promise<Place[]> {
  const travels = await (await payload()).find({
    collection: 'travels',
    locale,
    limit: 2000,
    pagination: false,
    sort: '-year',
  })
  return travels.docs.map((d) => ({
    id: d.id,
    city: d.city,
    country: d.country,
    countryName: countryName(d.country, locale),
    numeric: countryNumeric(d.country),
    continent: continentOf(d.country),
    year: d.year ?? null,
    lat: d.latitude,
    lng: d.longitude,
    note: d.note,
  }))
}
