import type { Locale } from '@/lib/i18n'
import { t } from '@/lib/i18n'
import { formatDuration, formatPace, routeShape, type Run } from '@/lib/strava'

const W = 220
const H = 88

export function RunCard({ run, locale }: { run: Run; locale: Locale }) {
  const shape = run.polyline ? routeShape(run.polyline, W, H, 12) : null
  const km = (run.distance / 1000).toLocaleString(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
  const date = new Date(run.date).toLocaleDateString(t(locale).dateLocale, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })

  return (
    <a
      className="run-card"
      href={`https://www.strava.com/activities/${run.id}`}
      target="_blank"
      rel="noopener"
      title={t(locale).runs.viewOnStrava}
    >
      <span className="run-date">{date.replace('.', '')}</span>
      <svg className="run-route" viewBox={`0 0 ${W} ${H}`} aria-hidden>
        {shape && (
          <>
            <path d={shape.d} className="run-path-glow" />
            <path d={shape.d} className="run-path" />
            <circle cx={shape.start[0]} cy={shape.start[1]} r="3.5" className="run-start" />
            <circle cx={shape.end[0]} cy={shape.end[1]} r="4" className="run-end" />
          </>
        )}
      </svg>
      <p className="run-distance">
        {km}
        <span>km</span>
      </p>
      <p className="run-name">{run.name}</p>
      <p className="run-stats">
        {formatDuration(run.movingTime)} · {formatPace(run.distance, run.movingTime)} /km
      </p>
    </a>
  )
}

export function StravaCredit({ locale }: { locale: Locale }) {
  return (
    <p className="strava-credit">
      <a href="https://www.strava.com" target="_blank" rel="noopener">
        {t(locale).runs.poweredBy}
      </a>
    </p>
  )
}
