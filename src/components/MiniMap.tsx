'use client'

import dynamic from 'next/dynamic'
import type { Place } from './mapTypes'

const TravelMap = dynamic(() => import('./TravelMap'), {
  ssr: false,
  loading: () => <div className="travel-map-mini" />,
})

/** Non-interactive map used on the home page banner. */
export function MiniMap({ places }: { places: Place[] }) {
  return <TravelMap places={places} variant="mini" region="near" />
}
