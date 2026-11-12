'use client'

import 'leaflet/dist/leaflet.css'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CircleMarker, GeoJSON, MapContainer, useMap } from 'react-leaflet'
import { feature } from 'topojson-client'
import type { Topology } from 'topojson-specification'
import { placeKey, regionBounds, type Place, type Region } from './mapTypes'

type Ring = number[][]

/** Rings crossing the 180° meridian (Russia, Fiji, Aleutians…) are shifted east so Leaflet doesn't draw lines across the map. */
const fixRing = (ring: Ring): Ring => {
  const lngs = ring.map((c) => c[0])
  if (Math.max(...lngs) - Math.min(...lngs) <= 180) return ring
  return ring.map(([lng, lat]) => [lng < 0 ? lng + 360 : lng, lat])
}

const cleanWorld = (fc: FeatureCollection<Geometry>): FeatureCollection<Geometry> => ({
  ...fc,
  features: fc.features
    .filter((f) => String(f.id) !== '010') // Antarctica
    .map((f) => {
      const g = f.geometry
      if (g.type === 'Polygon')
        return { ...f, geometry: { ...g, coordinates: g.coordinates.map(fixRing) } }
      if (g.type === 'MultiPolygon')
        return {
          ...f,
          geometry: { ...g, coordinates: g.coordinates.map((poly) => poly.map(fixRing)) },
        }
      return f
    }),
})

let worldCache: Promise<FeatureCollection<Geometry>> | null = null
const loadWorld = () =>
  (worldCache ??= fetch('/countries-50m.json')
    .then((r) => r.json())
    .then((topo: Topology) =>
      cleanWorld(
        feature(topo, topo.objects.countries) as unknown as FeatureCollection<Geometry>,
      ),
    ))

function FitRegion({ region }: { region: Region }) {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(regionBounds[region], { animate: true })
  }, [map, region])
  return null
}

type Props = {
  places: Place[]
  year?: number | null
  region?: Region
  variant?: 'full' | 'mini'
  selectedKey?: string | null
  onSelect?: (place: Place & { years: number[] }) => void
}

export default function TravelMap({
  places,
  year = null,
  region = 'near',
  variant = 'full',
  selectedKey = null,
  onSelect,
}: Props) {
  const wrapper = useRef<HTMLDivElement>(null)
  const [world, setWorld] = useState<FeatureCollection<Geometry> | null>(null)
  const [colors, setColors] = useState<Record<string, string> | null>(null)
  const mini = variant === 'mini'

  useEffect(() => {
    loadWorld()
      .then(setWorld)
      .catch(() => setWorld(null))
  }, [])

  // Map colours come from CSS variables, so they follow the design
  useEffect(() => {
    if (!wrapper.current) return
    const css = getComputedStyle(wrapper.current)
    const v = (name: string) => css.getPropertyValue(name).trim()
    setColors({
      land: v('--map-land'),
      border: v('--map-border'),
      visited: v('--map-visited'),
      visitedBorder: v('--map-visited-border'),
      marker: v('--map-marker'),
      markerStroke: v('--map-marker-stroke'),
    })
  }, [])

  const visible = useMemo(
    () => (year ? places.filter((p) => p.year === year) : places),
    [places, year],
  )
  const visitedNumeric = useMemo(
    () => new Set(visible.map((p) => p.numeric).filter(Boolean) as string[]),
    [visible],
  )

  // One marker per city, listing every year it was visited
  const cities = useMemo(() => {
    const map = new Map<string, Place & { years: number[] }>()
    for (const p of visible) {
      if (typeof p.lat !== 'number' || typeof p.lng !== 'number') continue
      const key = placeKey(p)
      const existing = map.get(key)
      if (existing) existing.years.push(p.year)
      else map.set(key, { ...p, years: [p.year] })
    }
    return [...map.values()]
  }, [visible])

  const style = (f?: Feature) => {
    const visited = f && visitedNumeric.has(String(f.id))
    return {
      weight: mini ? 0.4 : 0.7,
      color: visited ? colors?.visitedBorder : colors?.border,
      fillColor: visited ? colors?.visited : colors?.land,
      fillOpacity: 1,
    }
  }

  return (
    <div ref={wrapper} className={mini ? 'travel-map-mini' : 'travel-map-wrap'}>
      <MapContainer
        bounds={regionBounds[region]}
        zoomSnap={0.25}
        minZoom={1}
        maxZoom={8}
        maxBounds={[
          [-85, -220],
          [85, 220],
        ]}
        scrollWheelZoom={false}
        attributionControl={false}
        zoomControl={!mini}
        dragging={!mini}
        doubleClickZoom={!mini}
        touchZoom={!mini}
        keyboard={!mini}
        className="travel-map"
      >
        {!mini && <FitRegion region={region} />}
        {world && colors && (
          <GeoJSON
            key={[...visitedNumeric].join(',')}
            data={world}
            style={style}
            interactive={false}
          />
        )}
        {colors &&
          cities.map((c) => {
            const key = placeKey(c)
            const selected = key === selectedKey
            return (
              <CircleMarker
                key={key}
                center={[c.lat!, c.lng!]}
                radius={mini ? 3 : selected ? 9 : 6}
                interactive={!mini}
                pathOptions={{
                  color: colors.markerStroke,
                  weight: mini ? 1 : 2,
                  fillColor: colors.marker,
                  fillOpacity: 1,
                }}
                eventHandlers={{ click: () => onSelect?.(c) }}
              />
            )
          })}
      </MapContainer>
    </div>
  )
}
