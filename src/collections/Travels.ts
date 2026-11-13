import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { countryOptions } from '../lib/countries'
import { anyone } from './access'

/**
 * Fills latitude / longitude automatically from the city + country
 * using OpenStreetMap's Nominatim service, when they are left empty.
 */
const geocode: CollectionBeforeChangeHook = async ({ data, req }) => {
  const hasCoords = typeof data.latitude === 'number' && typeof data.longitude === 'number'
  if (hasCoords || !data.city || !data.country) return data
  try {
    const params = new URLSearchParams({
      city: String(data.city),
      countrycodes: String(data.country).toLowerCase(),
      format: 'json',
      limit: '1',
    })
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { 'User-Agent': 'mohamed-diallo.com (personal website)' },
      signal: AbortSignal.timeout(6000),
    })
    if (res.ok) {
      const [hit] = (await res.json()) as { lat: string; lon: string }[]
      if (hit) {
        data.latitude = Number(hit.lat)
        data.longitude = Number(hit.lon)
      }
    }
  } catch (err) {
    req.payload.logger.warn(`Geocoding failed for ${data.city}: ${String(err)}`)
  }
  return data
}

export const Travels: CollectionConfig = {
  slug: 'travels',
  labels: {
    singular: { fr: 'Lieu visité', en: 'Visited place' },
    plural: { fr: 'Carte — lieux visités', en: 'Map — visited places' },
  },
  admin: {
    useAsTitle: 'city',
    defaultColumns: ['city', 'country', 'year'],
    group: { fr: 'Contenu', en: 'Content' },
    description: {
      fr: 'Une entrée par ville et par voyage. Les coordonnées GPS sont trouvées automatiquement si vous les laissez vides.',
      en: 'One entry per city and per trip. GPS coordinates are found automatically if left empty.',
    },
  },
  access: { read: anyone },
  defaultSort: '-year',
  hooks: { beforeChange: [geocode] },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'city',
          type: 'text',
          required: true,
          localized: true,
          label: { fr: 'Ville', en: 'City' },
        },
        {
          name: 'country',
          type: 'select',
          required: true,
          options: countryOptions(),
          label: { fr: 'Pays', en: 'Country' },
        },
        {
          name: 'year',
          type: 'number',
          min: 1950,
          max: 2100,
          label: { fr: 'Année', en: 'Year' },
          admin: {
            description: {
              fr: 'Laissez vide pour votre pays (affiché comme « Chez moi », sans date).',
              en: 'Leave empty for your home country (shown as “Home”, without a date).',
            },
          },
        },
      ],
    },
    {
      name: 'note',
      type: 'textarea',
      localized: true,
      label: { fr: 'Souvenir / contexte (facultatif)', en: 'Memory / context (optional)' },
    },
    {
      type: 'collapsible',
      label: { fr: 'Coordonnées GPS', en: 'GPS coordinates' },
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'latitude', type: 'number', label: 'Latitude' },
            { name: 'longitude', type: 'number', label: 'Longitude' },
          ],
        },
      ],
    },
  ],
}
