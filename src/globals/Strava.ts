import crypto from 'crypto'
import type { GlobalConfig, PayloadHandler } from 'payload'

const AUTHORIZE_URL = 'https://www.strava.com/oauth/authorize'
const TOKEN_URL = 'https://www.strava.com/oauth/token'
const STATE_COOKIE = 'strava_oauth_state'

const callbackUrl = () => `${process.env.NEXT_PUBLIC_SERVER_URL}/api/globals/strava/callback`

const readCookie = (header: string | null, name: string) =>
  header
    ?.split(';')
    .map((c) => c.trim().split('='))
    .find(([k]) => k === name)?.[1]

/** Step 1: send the logged-in admin to Strava's consent screen. */
const connect: PayloadHandler = (req) => {
  if (!req.user) return Response.json({ error: 'Connexion à l’admin requise.' }, { status: 401 })
  if (!process.env.STRAVA_CLIENT_ID) {
    return Response.json(
      { error: 'STRAVA_CLIENT_ID manquant dans le fichier .env.' },
      { status: 500 },
    )
  }
  const state = crypto.randomBytes(16).toString('hex')
  const url = new URL(AUTHORIZE_URL)
  url.searchParams.set('client_id', process.env.STRAVA_CLIENT_ID)
  url.searchParams.set('redirect_uri', callbackUrl())
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('approval_prompt', 'auto')
  // Public and followers-only activities; Strava strips privacy-zone data.
  url.searchParams.set('scope', 'read,activity:read')
  url.searchParams.set('state', state)
  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
      'Set-Cookie': `${STATE_COOKIE}=${state}; Path=/api/globals/strava; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  })
}

/** Step 2: Strava sends the admin back here with a one-time code. */
const callback: PayloadHandler = async (req) => {
  if (!req.user) return Response.json({ error: 'Connexion à l’admin requise.' }, { status: 401 })
  const code = req.searchParams.get('code')
  const state = req.searchParams.get('state')
  if (!code || !state || state !== readCookie(req.headers.get('cookie'), STATE_COOKIE)) {
    return Response.json({ error: 'Autorisation Strava invalide ou expirée.' }, { status: 400 })
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) {
    req.payload.logger.error(`Strava token exchange failed: ${res.status} ${await res.text()}`)
    return Response.json({ error: 'Échange avec Strava impossible.' }, { status: 502 })
  }
  const data = await res.json()

  await req.payload.updateGlobal({
    slug: 'strava',
    data: {
      athleteName: [data.athlete?.firstname, data.athlete?.lastname].filter(Boolean).join(' '),
      athleteId: String(data.athlete?.id ?? ''),
      connectedAt: new Date().toISOString(),
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
    },
  })

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/admin/globals/strava',
      'Set-Cookie': `${STATE_COOKIE}=; Path=/api/globals/strava; Max-Age=0`,
    },
  })
}

const loggedIn = ({ req }: { req: { user: unknown } }) => Boolean(req.user)

export const Strava: GlobalConfig = {
  slug: 'strava',
  label: { fr: 'Strava', en: 'Strava' },
  admin: {
    group: { fr: 'Réglages', en: 'Settings' },
    description: {
      fr: 'Pour connecter ou reconnecter votre compte Strava, ouvrez https://mohamed-diallo.com/api/globals/strava/connect en étant connecté à l’admin. Vos courses publiques apparaissent ensuite automatiquement sur le site.',
      en: 'To connect or reconnect your Strava account, open https://mohamed-diallo.com/api/globals/strava/connect while logged in to the admin. Your public runs then appear on the site automatically.',
    },
  },
  access: { read: loggedIn, update: loggedIn },
  endpoints: [
    { path: '/connect', method: 'get', handler: connect },
    { path: '/callback', method: 'get', handler: callback },
  ],
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      label: { fr: 'Afficher mes courses sur le site', en: 'Show my runs on the site' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'athleteName',
          type: 'text',
          label: { fr: 'Compte connecté', en: 'Connected account' },
          admin: { readOnly: true },
        },
        {
          name: 'connectedAt',
          type: 'date',
          label: { fr: 'Connecté le', en: 'Connected on' },
          admin: { readOnly: true },
        },
      ],
    },
    { name: 'athleteId', type: 'text', admin: { hidden: true } },
    { name: 'accessToken', type: 'text', admin: { hidden: true } },
    { name: 'refreshToken', type: 'text', admin: { hidden: true } },
    { name: 'expiresAt', type: 'number', admin: { hidden: true } },
  ],
}
