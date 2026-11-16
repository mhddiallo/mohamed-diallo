export type VideoSource = { provider: 'youtube' | 'vimeo'; id: string }

/** Recognises YouTube (watch, youtu.be, shorts, embed, live) and Vimeo links. */
export function parseVideoUrl(raw: string): VideoSource | null {
  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    return null
  }
  const host = url.hostname.replace(/^www\.|^m\./, '')
  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0]
    return id ? { provider: 'youtube', id } : null
  }
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const v = url.searchParams.get('v')
    if (v) return { provider: 'youtube', id: v }
    const m = url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/)
    return m ? { provider: 'youtube', id: m[1] } : null
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const m = url.pathname.match(/(\d{6,})/)
    return m ? { provider: 'vimeo', id: m[1] } : null
  }
  return null
}
