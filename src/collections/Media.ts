import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: { fr: 'Média', en: 'Media' },
    plural: { fr: 'Médias', en: 'Media' },
  },
  admin: {
    group: { fr: 'Administration', en: 'Administration' },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: { fr: 'Texte alternatif', en: 'Alt text' },
      localized: true,
      admin: {
        description: {
          fr: 'Courte description de l’image (accessibilité).',
          en: 'Short description of the image (accessibility).',
        },
      },
    },
  ],
  upload: {
    staticDir: process.env.MEDIA_DIR || 'media',
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumbnail', width: 400 },
      { name: 'card', width: 800 },
      { name: 'large', width: 1600 },
    ],
    adminThumbnail: 'thumbnail',
  },
}
