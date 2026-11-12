import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { fr } from '@payloadcms/translations/languages/fr'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Articles } from './collections/Articles'
import { GoalDomains, Goals } from './collections/Goals'
import { Interests } from './collections/Interests'
import { Media } from './collections/Media'
import { Notes } from './collections/Notes'
import { Themes } from './collections/Themes'
import { Travels } from './collections/Travels'
import { Users } from './collections/Users'
import { About } from './globals/About'
import { Settings } from './globals/Settings'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug,
    avatar: 'default',
    meta: { titleSuffix: ' — Admin Mohamed Diallo' },
    importMap: { baseDir: path.resolve(dirname) },
  },
  i18n: {
    supportedLanguages: { fr, en },
    fallbackLanguage: 'fr',
  },
  localization: {
    locales: [
      { code: 'fr', label: 'Français' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'fr',
    fallback: true,
  },
  collections: [Articles, Themes, Notes, Travels, Interests, Goals, GoalDomains, Media, Users],
  globals: [About, Settings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    // In production the schema is managed by migrations (src/migrations),
    // which run automatically when the server starts.
    prodMigrations: migrations,
  }),
  sharp,
})
