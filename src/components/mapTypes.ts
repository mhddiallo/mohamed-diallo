// Shared map types and helpers — safe to import on the server (no Leaflet here).

export type Place = {
  id: number
  city: string
  country: string
  countryName: string
  numeric?: string
  continent?: string
  /** Null for the home country (no date). */
  year: number | null
  lat?: number | null
  lng?: number | null
  note?: string | null
}

export type Region = 'near' | 'world'

export const regionBounds: Record<Region, [[number, number], [number, number]]> = {
  near: [
    [-2, -22],
    [52, 34],
  ],
  world: [
    [-48, -150],
    [72, 165],
  ],
}

export const placeKey = (p: Pick<Place, 'country' | 'city'>) => `${p.country}-${p.city}`

