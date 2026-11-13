'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import { placeKey, type Place, type Region } from './mapTypes'
import { CountUp } from './motion/CountUp'

const TravelMap = dynamic(() => import('./TravelMap'), {
  ssr: false,
  loading: () => <div className="travel-map-wrap map-loading" />,
})

type Labels = {
  all: string
  countries: string
  cities: string
  continents: string
  regionNear: string
  regionWorld: string
  byYear: string
  home: string
}

export function MapExplorer({
  title,
  intro,
  places,
  labels,
}: {
  title: string
  intro: string
  places: Place[]
  labels: Labels
}) {
  const [year, setYear] = useState<number | null>(null)
  const [region, setRegion] = useState<Region>('near')
  const [selected, setSelected] = useState<(Place & { years: number[] }) | null>(null)

  const years = useMemo(
    () =>
      [...new Set(places.map((p) => p.year).filter((y): y is number => y !== null))].sort(
        (a, b) => a - b,
      ),
    [places],
  )
  const visible = year ? places.filter((p) => p.year === year) : places
  const countryCount = new Set(visible.map((p) => p.country)).size
  const cityCount = new Set(visible.map(placeKey)).size
  const continentCount = new Set(visible.map((p) => p.continent).filter(Boolean)).size

  // Trips grouped by year (most recent first)
  const byYear = useMemo(() => {
    // Home country (no year) comes first, then years from most recent
    const groups = new Map<number, Place[]>()
    for (const p of visible) {
      const y = p.year ?? Infinity
      if (!groups.has(y)) groups.set(y, [])
      groups.get(y)!.push(p)
    }
    return [...groups.entries()].sort((a, b) => b[0] - a[0])
  }, [visible])

  return (
    <>
      <section className="map-head">
        <div>
          <h1>{title}</h1>
          <p className="lede">{intro}</p>
        </div>
        <div className="stat-cards">
          <div className="stat-card stat-laterite">
            <span>{labels.countries}</span>
            <strong>
              <CountUp value={countryCount} duration={700} />
            </strong>
          </div>
          <div className="stat-card stat-baobab">
            <span>{labels.cities}</span>
            <strong>
              <CountUp value={cityCount} duration={700} />
            </strong>
          </div>
          <div className="stat-card stat-ocre">
            <span>{labels.continents}</span>
            <strong>
              <CountUp value={continentCount} duration={700} />
            </strong>
          </div>
        </div>
      </section>

      <div className="map-toolbar">
        <div className="chips" role="group">
          <button aria-pressed={year === null} onClick={() => setYear(null)}>
            {labels.all}
          </button>
          {years.map((y) => (
            <button key={y} aria-pressed={year === y} onClick={() => setYear(y)}>
              {y}
            </button>
          ))}
        </div>
        <div className="segmented" role="group">
          <button aria-pressed={region === 'near'} onClick={() => setRegion('near')}>
            {labels.regionNear}
          </button>
          <button aria-pressed={region === 'world'} onClick={() => setRegion('world')}>
            {labels.regionWorld}
          </button>
        </div>
      </div>

      <div className="map-stage">
        <TravelMap
          places={places}
          year={year}
          region={region}
          selectedKey={selected ? placeKey(selected) : null}
          onSelect={setSelected}
        />
        {selected && (
          <div className="map-card" role="status">
            <button className="map-card-close" aria-label="×" onClick={() => setSelected(null)}>
              ×
            </button>
            <span className="map-card-year">
              {selected.years.length > 0
                ? [...new Set(selected.years)].sort().join(' · ')
                : labels.home}
            </span>
            <strong>{selected.city}</strong>
            <span className="map-card-meta">
              {selected.countryName}
              {selected.note ? ` · ${selected.note}` : ''}
            </span>
          </div>
        )}
      </div>

      <section className="section">
        <h2 className="section-title">{labels.byYear}</h2>
        <div className="year-grid">
          {byYear.map(([y, list]) => (
            <article key={y} className="year-card">
              <h3>{y === Infinity ? labels.home : y}</h3>
              <ul>
                {list.map((p) => (
                  <li key={p.id}>
                    <button
                      className="trip"
                      onClick={() => {
                        setSelected({ ...p, years: p.year ? [p.year] : [] })
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                    >
                      <strong>{p.city}</strong> <span>· {p.countryName}</span>
                    </button>
                    {p.note && <p>{p.note}</p>}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
