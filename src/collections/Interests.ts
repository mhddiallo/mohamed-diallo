import type { CollectionConfig } from 'payload'
import { anyone } from './access'

export const interestKinds = [
  { value: 'book', label: { fr: 'Livre', en: 'Book' } },
  { value: 'film', label: { fr: 'Film', en: 'Film' } },
  { value: 'series', label: { fr: 'Série', en: 'Series' } },
  { value: 'activity', label: { fr: 'Activité', en: 'Activity' } },
]

export const Interests: CollectionConfig = {
  slug: 'interests',
  labels: {
    singular: { fr: 'Intérêt', en: 'Interest' },
    plural: { fr: 'Intérêts', en: 'Interests' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'status', 'date'],
    group: { fr: 'Contenu', en: 'Content' },
    description: {
      fr: 'Ce que je lis, ce que je regarde, ce que je fais.',
      en: 'What I read, what I watch, what I do.',
    },
  },
  access: { read: anyone },
  defaultSort: '-date',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'kind',
          type: 'select',
          required: true,
          options: interestKinds,
          label: { fr: 'Type', en: 'Type' },
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'current',
          options: [
            { value: 'current', label: { fr: 'En cours', en: 'In progress' } },
            { value: 'done', label: { fr: 'Terminé', en: 'Finished' } },
            { value: 'wishlist', label: { fr: 'À venir', en: 'Up next' } },
          ],
          label: { fr: 'Statut', en: 'Status' },
        },
      ],
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { fr: 'Titre', en: 'Title' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'creator',
          type: 'text',
          label: { fr: 'Auteur / réalisateur', en: 'Author / director' },
          admin: {
            condition: (data) => data?.kind !== 'activity',
          },
        },
        {
          name: 'releaseYear',
          type: 'number',
          label: { fr: 'Année de sortie', en: 'Release year' },
          admin: {
            condition: (data) => data?.kind !== 'activity',
          },
        },
      ],
    },
    {
      name: 'comment',
      type: 'textarea',
      localized: true,
      label: { fr: 'Mon avis / pourquoi', en: 'My take / why' },
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      label: { fr: 'Note (1 à 5)', en: 'Rating (1 to 5)' },
      admin: { position: 'sidebar', step: 0.5 },
    },
    {
      name: 'date',
      type: 'date',
      label: { fr: 'Date (début ou fin)', en: 'Date (start or finish)' },
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { displayFormat: 'dd/MM/yyyy' } },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: { fr: 'Image / couverture', en: 'Image / cover' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'link',
      type: 'text',
      label: { fr: 'Lien (facultatif)', en: 'Link (optional)' },
      admin: { position: 'sidebar' },
    },
  ],
}
