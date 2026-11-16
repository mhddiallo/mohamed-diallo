import { readFileSync } from 'fs'
import { payload } from '@/lib/payload'

export type Run = {
  id: number
  name: string
  /** Local start date, ISO */
  date: string
  /** metres */
  distance: number
  /** seconds */
  movingTime: number
  polyline: string
}

type StravaActivity = {
  id: number
  name: string
  type?: string
  sport_type?: string
  visibility?: string
  private?: boolean
  start_date_local: string
  distance: number
  moving_time: number
  map?: { summary_polyline?: string }
}

const RUN_TYPES = new Set(['Run', 'TrailRun', 'VirtualRun'])
const CACHE_MS = 30 * 60 * 1000

let cache: { at: number; runs: Run[] } | null = null

async function accessToken(): Promise<string | null> {
  const p = await payload()
  const g = await p.findGlobal({ slug: 'strava', overrideAccess: true })
  if (!g.enabled || !g.refreshToken) return null
  if (g.accessToken && g.expiresAt && g.expiresAt * 1000 > Date.now() + 60_000) return g.accessToken

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: g.refreshToken,
    }),
  })
  if (!res.ok) {
    p.logger.error(`Strava token refresh failed: ${res.status}`)
    return null
  }
  const data = await res.json()
  await p.updateGlobal({
    slug: 'strava',
    overrideAccess: true,
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
    },
  })
  return data.access_token
}

/** Latest public runs from Strava, cached for 30 minutes. Never throws. */
export async function getRuns(limit = 30): Promise<Run[]> {
  // Local preview: STRAVA_FIXTURE=/path/to/runs.json
  if (process.env.STRAVA_FIXTURE) {
    return (JSON.parse(readFileSync(process.env.STRAVA_FIXTURE, 'utf8')) as Run[]).slice(0, limit)
  }
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.runs.slice(0, limit)

  try {
    const token = await accessToken()
    if (!token) return []
    const res = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=60', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`activities ${res.status}`)
    const activities = (await res.json()) as StravaActivity[]
    const runs: Run[] = activities
      .filter(
        (a) => RUN_TYPES.has(a.sport_type ?? a.type ?? '') && a.visibility !== 'only_me' && !a.private,
      )
      .map((a) => ({
        id: a.id,
        name: a.name,
        date: a.start_date_local,
        distance: a.distance,
        movingTime: a.moving_time,
        polyline: a.map?.summary_polyline ?? '',
      }))
    cache = { at: Date.now(), runs }
    return runs.slice(0, limit)
  } catch (err) {
    ;(await payload()).logger.error(`Strava: ${(err as Error).message}`)
    return cache?.runs.slice(0, limit) ?? []
  }
}

/* ---------- Formatting ---------- */

export const formatDuration = (s: number) => {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.round(s % 60)
  const pad = (n: number) => String(n).padStart(2, '0')
  return h ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`
}

/** Pace in min/km, e.g. "4:56" */
export const formatPace = (metres: number, seconds: number) => {
  if (!metres) return '–'
  const perKm = seconds / (metres / 1000)
  return `${Math.floor(perKm / 60)}:${String(Math.round(perKm % 60)).padStart(2, '0')}`
}

/* ---------- Route shape ---------- */

/** Google encoded polyline → [lat, lng][] */
export function decodePolyline(str: string): [number, number][] {
  const points: [number, number][] = []
  let index = 0
  let lat = 0
  let lng = 0
  while (index < str.length) {
    for (const axis of [0, 1]) {
      let result = 0
      let shift = 0
      let byte: number
      do {
        byte = str.charCodeAt(index++) - 63
        result |= (byte & 0x1f) << shift
        shift += 5
      } while (byte >= 0x20 && index < str.length)
      const delta = result & 1 ? ~(result >> 1) : result >> 1
      if (axis === 0) lat += delta
      else lng += delta
    }
    points.push([lat / 1e5, lng / 1e5])
  }
  return points
}

const haversine = ([a1, o1]: [number, number], [a2, o2]: [number, number]) => {
  const r = Math.PI / 180
  const dLat = (a2 - a1) * r
  const dLng = (o2 - o1) * r
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a1 * r) * Math.cos(a2 * r) * Math.sin(dLng / 2) ** 2
  return 12742000 * Math.asin(Math.sqrt(h))
}

/**
 * Turns a polyline into an SVG path that fits the given box. The first and
 * last 200 m are dropped so the shape never points at a start/finish address.
 */
export function routeShape(polyline: string, width: number, height: number, pad = 10) {
  let pts = decodePolyline(polyline)
  if (pts.length < 2) return null

  const trim = 200
  const cum = [0]
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + haversine(pts[i - 1], pts[i]))
  const total = cum[cum.length - 1]
  if (total > trim * 4) {
    const kept = pts.filter((_, i) => cum[i] >= trim && cum[i] <= total - trim)
    if (kept.length >= 2) pts = kept
  }

  const lat0 = pts.reduce((s, p) => s + p[0], 0) / pts.length
  const k = Math.cos((lat0 * Math.PI) / 180)
  const xy = pts.map(([lat, lng]) => [lng * k, -lat])
  const xs = xy.map((p) => p[0])
  const ys = xy.map((p) => p[1])
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const w = Math.max(...xs) - minX || 1e-9
  const h = Math.max(...ys) - minY || 1e-9
  const scale = Math.min((width - pad * 2) / w, (height - pad * 2) / h)
  const ox = (width - w * scale) / 2
  const oy = (height - h * scale) / 2
  const proj = xy.map(([x, y]) => [ox + (x - minX) * scale, oy + (y - minY) * scale] as const)

  const d = proj.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('')
  return { d, start: proj[0], end: proj[proj.length - 1] }
}
