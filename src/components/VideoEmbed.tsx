'use client'

import { useState } from 'react'
import { parseVideoUrl } from '@/lib/video'

/**
 * Shows a poster with a play button; the third-party player (and its
 * cookies) only loads once the reader clicks.
 */
export function VideoEmbed({
  url,
  caption,
  playLabel,
}: {
  url: string
  caption?: string | null
  playLabel: string
}) {
  const [playing, setPlaying] = useState(false)
  const [posterFailed, setPosterFailed] = useState(false)
  const source = parseVideoUrl(url)
  if (!source) return null

  const src =
    source.provider === 'youtube'
      ? `https://www.youtube-nocookie.com/embed/${source.id}?autoplay=1&rel=0`
      : `https://player.vimeo.com/video/${source.id}?autoplay=1&dnt=1`
  // YouTube publishes a still for every video; Vimeo gets a plain dark poster.
  const poster =
    source.provider === 'youtube' ? `https://i.ytimg.com/vi/${source.id}/hqdefault.jpg` : null

  return (
    <figure className="video-embed">
      <div className="video-frame">
        {playing ? (
          <iframe
            src={src}
            title={caption || 'Video'}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="video-poster"
            onClick={() => setPlaying(true)}
            aria-label={playLabel}
          >
            {poster && !posterFailed && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster} alt="" loading="lazy" onError={() => setPosterFailed(true)} />
            )}
            <span className="video-play" aria-hidden>
              <svg viewBox="0 0 24 24" width="28" height="28">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            </span>
          </button>
        )}
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
