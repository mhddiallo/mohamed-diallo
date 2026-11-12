import type { CollectionConfig } from 'payload'
import { anyone } from './access'

export const GoalDomains: CollectionConfig = {
  slug: 'goal-domains',
  labels: {
    singular: { fr: 'Domaine', en: 'Domain' },
    plural: { fr: 'Domaines d’objectifs', en: 'Goal domains' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'order'],
    group: { fr: 'Objectifs', en: 'Goals' },
    description: {
      fr: 'Ex. : Sport, Carrière, Finances, Apprentissage, Spiritualité…',
      en: 'E.g. Sport, Career, Finance, Learning, Spirituality…',
    },
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
      name: 'icon',
      type: 'text',
      label: { fr: 'Emoji (facultatif)', en: 'Emoji (optional)' },
      admin: { description: { fr: 'Ex. : 🏃 📚 💼', en: 'E.g. 🏃 📚 💼' } },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: { fr: 'Ordre d’affichage', en: 'Display order' },
    },
  ],
}

export const goalStatuses = [
  { value: 'planned', label: { fr: 'Prévu', en: 'Planned' } },
  { value: 'in_progress', label: { fr: 'En cours', en: 'In progress' } },
  { value: 'achieved', label: { fr: 'Atteint', en: 'Achieved' } },
  { value: 'dropped', label: { fr: 'Abandonné', en: 'Dropped' } },
]

export const Goals: CollectionConfig = {
  slug: 'goals',
  labels: {
    singular: { fr: 'Objectif', en: 'Goal' },
    plural: { fr: 'Objectifs', en: 'Goals' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'year', 'domain', 'status', 'progress'],
    group: { fr: 'Objectifs', en: 'Goals' },
  },
  access: { read: anyone },
  defaultSort: '-year',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { fr: 'Objectif', en: 'Goal' },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: { fr: 'Détails (facultatif)', en: 'Details (optional)' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'year',
          type: 'number',
          required: true,
          defaultValue: () => new Date().getFullYear(),
          label: { fr: 'Année', en: 'Year' },
        },
        {
          name: 'domain',
          type: 'relationship',
          relationTo: 'goal-domains',
          required: true,
          label: { fr: 'Domaine', en: 'Domain' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'planned',
          options: goalStatuses,
          label: { fr: 'Statut', en: 'Status' },
        },
        {
          name: 'current',
          type: 'number',
          min: 0,
          label: { fr: 'Avancement actuel', en: 'Current' },
          admin: {
            description: { fr: 'Ex. : 14 (livres lus)', en: 'E.g. 14 (books read)' },
          },
        },
        {
          name: 'target',
          type: 'number',
          min: 0,
          label: { fr: 'Cible', en: 'Target' },
          admin: {
            description: {
              fr: 'Ex. : 20. Facultatif — affiche une barre « 14 / 20 ».',
              en: 'E.g. 20. Optional — shows a “14 / 20” bar.',
            },
          },
        },
      ],
    },
  ],
}
