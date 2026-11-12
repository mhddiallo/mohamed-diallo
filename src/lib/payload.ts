import config from '@payload-config'
import { getPayload } from 'payload'
import type { Media } from '@/payload-types'

export const payload = () => getPayload({ config })

/** Returns a media object when the relation was populated, otherwise null. */
export const asMedia = (value: unknown): Media | null =>
  value && typeof value === 'object' && 'url' in value ? (value as Media) : null

/** Picks the best image size URL available. */
export const mediaUrl = (media: Media | null, size: 'thumbnail' | 'card' | 'large' = 'card') =>
  media ? media.sizes?.[size]?.url || media.url || null : null

/** Rough reading time from a Lexical rich text value. */
export const readingTime = (content: unknown): number => {
  const text = JSON.stringify(content ?? '').replace(/"[a-zA-Z]+":/g, ' ')
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}
