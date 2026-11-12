import type { CollectionConfig } from 'payload'
import { publishedOrLoggedIn } from './access'
import { publishedAtField, slugField } from './fields'

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: {
    singular: { fr: 'Article', en: 'Article' },
    plural: { fr: 'Articles', en: 'Articles' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'theme', 'publishedAt', '_status'],
    group: { fr: 'Articles', en: 'Articles' },
  },
  access: { read: publishedOrLoggedIn },
  defaultSort: '-publishedAt',
  versions: {
    drafts: { autosave: { interval: 2000 } },
    maxPerDoc: 30,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { fr: 'Titre', en: 'Title' },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      label: { fr: 'Chapeau / résumé', en: 'Excerpt' },
      admin: {
        description: {
          fr: 'Deux ou trois phrases affichées dans la liste des articles.',
          en: 'Two or three sentences shown in the article list.',
        },
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: { fr: 'Image de couverture', en: 'Cover image' },
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      label: { fr: 'Contenu', en: 'Content' },
    },
    {
      name: 'theme',
      type: 'relationship',
      relationTo: 'themes',
      required: true,
      label: { fr: 'Thème', en: 'Theme' },
      admin: { position: 'sidebar' },
    },
    publishedAtField,
    slugField('title', true),
  ],
}
