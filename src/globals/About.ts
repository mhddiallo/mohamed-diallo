import type { GlobalConfig } from 'payload'

export const About: GlobalConfig = {
  slug: 'about',
  label: { fr: 'Page À propos', en: 'About page' },
  admin: { group: { fr: 'Pages', en: 'Pages' } },
  access: { read: () => true },
  fields: [
    {
      name: 'headline',
      type: 'text',
      localized: true,
      label: { fr: 'Accroche', en: 'Headline' },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: { fr: 'Photo', en: 'Photo' },
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      label: { fr: 'Texte', en: 'Text' },
    },
    {
      name: 'timeline',
      type: 'array',
      label: { fr: 'Parcours', en: 'Timeline' },
      labels: {
        singular: { fr: 'Étape', en: 'Step' },
        plural: { fr: 'Étapes', en: 'Steps' },
      },
      fields: [
        {
          name: 'category',
          type: 'select',
          required: true,
          defaultValue: 'experience',
          label: { fr: 'Catégorie', en: 'Category' },
          options: [
            { value: 'experience', label: { fr: 'Expérience professionnelle', en: 'Work experience' } },
            { value: 'education', label: { fr: 'Formation', en: 'Education' } },
            { value: 'certification', label: { fr: 'Certification', en: 'Certification' } },
            { value: 'award', label: { fr: 'Distinction', en: 'Award' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'period', type: 'text', required: true, label: { fr: 'Période', en: 'Period' } },
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              label: { fr: 'Intitulé', en: 'Title' },
            },
          ],
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: { fr: 'Description', en: 'Description' },
        },
      ],
    },
  ],
}
