import type { CollectionConfig } from 'payload'
import { publishedOrLoggedIn } from './access'
import { publishedAtField } from './fields'

export const Notes: CollectionConfig = {
  slug: 'notes',
  labels: {
    singular: { fr: 'Note', en: 'Note' },
    plural: { fr: 'Notes', en: 'Notes' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', '_status'],
    group: { fr: 'Contenu', en: 'Content' },
    description: {
      fr: 'Pensées courtes. Le titre est facultatif.',
      en: 'Short thoughts. The title is optional.',
    },
  },
  access: { read: publishedOrLoggedIn },
  defaultSort: '-publishedAt',
  versions: { drafts: true, maxPerDoc: 10 },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      label: { fr: 'Titre (facultatif)', en: 'Title (optional)' },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      localized: true,
      label: { fr: 'Contenu', en: 'Content' },
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      label: { fr: 'Mots-clés', en: 'Tags' },
      admin: { position: 'sidebar' },
    },
    publishedAtField,
  ],
}
