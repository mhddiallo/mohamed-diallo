import type { CollectionConfig } from 'payload'
import { anyone } from './access'
import { slugField } from './fields'

export const Themes: CollectionConfig = {
  slug: 'themes',
  labels: {
    singular: { fr: 'Thème', en: 'Theme' },
    plural: { fr: 'Thèmes', en: 'Themes' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order'],
    group: { fr: 'Articles', en: 'Articles' },
  },
  access: { read: anyone },
  defaultSort: 'order',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: { fr: 'Nom', en: 'Name' },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: { fr: 'Description', en: 'Description' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: { fr: 'Ordre d’affichage', en: 'Display order' },
      admin: { position: 'sidebar' },
    },
    slugField('name'),
  ],
}
