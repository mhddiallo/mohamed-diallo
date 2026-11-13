import { countries as countryData } from 'countries-list'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import frLocale from 'i18n-iso-countries/langs/fr.json'

countries.registerLocale(frLocale)
countries.registerLocale(enLocale)

export type Locale = 'fr' | 'en'

export const countryName = (code: string, locale: Locale): string =>
  countries.getName(code, locale, { select: 'official' }) ?? code

/** ISO 3166-1 numeric code (as used by world-atlas), e.g. "SN" -> "686". */
export const countryNumeric = (code: string): string | undefined =>
  countries.alpha2ToNumeric(code)

/** Options for the admin select field, sorted by French name. */
export const countryOptions = () => {
  const fr = countries.getNames('fr', { select: 'official' })
  const en = countries.getNames('en', { select: 'official' })
  return Object.keys(fr)
    .sort((a, b) => fr[a].localeCompare(fr[b], 'fr'))
    .map((code) => ({
      value: code,
      label: { fr: fr[code], en: en[code] ?? fr[code] },
    }))
}

/** Continent code (AF, EU, AS, NA, SA, OC, AN) of a country, e.g. "SN" -> "AF". */
export const continentOf = (code: string): string | undefined =>
  (countryData as Record<string, { continent?: string }>)[code]?.continent
