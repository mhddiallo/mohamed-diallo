'use client'

import 'leaflet/dist/leaflet.css'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import type { GeoJSON as LeafletGeoJSON } from 'leaflet'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { CircleMarker, GeoJSON, MapContainer, Pane, useMap } from 'react-leaflet'
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
      cleanWorld(feature(topo, topo.objects.countries) as unknown as FeatureCollection<Geometry>),
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
  const geoRef = useRef<LeafletGeoJSON>(null)

  // Intro animation: visited countries light up one by one, in the order
  // they were first visited. `lit` = how many are lit so far.
  const order = useMemo(() => {
    const first = new Map<string, number>()
    for (const p of places) {
      if (!p.numeric) continue
      first.set(p.numeric, Math.min(first.get(p.numeric) ?? Infinity, p.year))
    }
    return [...first.entries()].sort((a, b) => a[1] - b[1]).map(([n]) => n)
  }, [places])
  const [lit, setLit] = useState(0)

  useEffect(() => {
    const el = wrapper.current
    if (!el || !document.documentElement.classList.contains('anim')) {
      setLit(Infinity)
      return
    }
    let timer: ReturnType<typeof setInterval> | undefined
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        timer = setInterval(
          () => {
            setLit((n) => {
              if (n >= order.length) {
                clearInterval(timer)
                return Infinity
              }
              return n + 1
            })
          },
          mini ? 420 : 320,
        )
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      clearInterval(timer)
    }
  }, [order, mini])

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
  const visitedNumeric = useMemo(() => {
    const all = new Set(visible.map((p) => p.numeric).filter(Boolean) as string[])
    if (year || lit === Infinity) return all
    const shown = new Set(order.slice(0, lit))
    return new Set([...all].filter((n) => shown.has(n)))
  }, [visible, year, lit, order])

  // One marker per city, listing every year it was visited
  const cities = useMemo(() => {
    const map = new Map<string, Place & { years: number[] }>()
    for (const p of visible) {
      if (typeof p.lat !== 'number' || typeof p.lng !== 'number') continue
      if (p.numeric && !visitedNumeric.has(p.numeric)) continue
      const key = placeKey(p)
      const existing = map.get(key)
      if (existing) existing.years.push(p.year)
      else map.set(key, { ...p, years: [p.year] })
    }
    return [...map.values()]
  }, [visible, visitedNumeric])

  const style = (f?: Feature) => {
    const visited = f && visitedNumeric.has(String(f.id))
    return {
      weight: mini ? 0.4 : 0.7,
      color: visited ? colors?.visitedBorder : colors?.border,
      fillColor: visited ? colors?.visited : colors?.land,
      fillOpacity: 1,
    }
  }

  // Restyle the countries in place (cheaper than re-creating the layer)
  useEffect(() => {
    geoRef.current?.setStyle((f) => style(f))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitedNumeric, colors])

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
        {world && colors && <GeoJSON ref={geoRef} data={world} style={style} interactive={false} />}
        {/* Cities live in their own pane, always drawn above the countries */}
        <Pane name="cities" style={{ zIndex: 450 }}>
          {colors &&
            cities.map((c) => {
              const key = placeKey(c)
              const selected = key === selectedKey
              return (
                <Fragment key={key}>
                  {mini && (
                    <CircleMarker
                      center={[c.lat!, c.lng!]}
                      radius={3}
                      interactive={false}
                      pathOptions={{
                        className: 'pulse-ring',
                        color: colors.marker,
                        weight: 1.5,
                        fill: false,
                      }}
                    />
                  )}
                  <CircleMarker
                    center={[c.lat!, c.lng!]}
                    radius={mini ? 3 : selected ? 9 : 6}
                    interactive={!mini}
                    pathOptions={{
                      className: 'city-dot',
                      color: colors.markerStroke,
                      weight: mini ? 1 : 2,
                      fillColor: colors.marker,
                      fillOpacity: 1,
                    }}
                    eventHandlers={{ click: () => onSelect?.(c) }}
                  />
                </Fragment>
              )
            })}
        </Pane>
      </MapContainer>
    </div>
  )
}
