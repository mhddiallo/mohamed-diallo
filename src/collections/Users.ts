import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: { fr: 'Utilisateur', en: 'User' },
    plural: { fr: 'Utilisateurs', en: 'Users' },
  },
  admin: {
    useAsTitle: 'email',
    group: { fr: 'Administration', en: 'Administration' },
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      label: { fr: 'Nom', en: 'Name' },
    },
  ],
}
