import type { Field, FieldHook } from 'payload'

/** Turns any string into a URL-friendly slug (handles French accents). */
export const slugify = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const formatSlug =
  (fallbackField: string): FieldHook =>
  ({ value, data }) => {
    if (typeof value === 'string' && value.trim()) return slugify(value)
    const fallback = data?.[fallbackField]
    if (typeof fallback === 'string' && fallback.trim()) return slugify(fallback)
    return value
  }

/** A slug generated from another field when left empty. */
export const slugField = (fallbackField = 'title', localized = false): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  localized,
  label: { fr: 'Identifiant URL (slug)', en: 'URL slug' },
  admin: {
    position: 'sidebar',
    description: {
      fr: 'Laissez vide : il sera généré automatiquement à partir du titre.',
      en: 'Leave empty: it will be generated from the title.',
    },
  },
  hooks: {
    beforeValidate: [formatSlug(fallbackField)],
  },
})

export const publishedAtField: Field = {
  name: 'publishedAt',
  type: 'date',
  label: { fr: 'Date de publication', en: 'Publication date' },
  defaultValue: () => new Date().toISOString(),
  admin: {
    position: 'sidebar',
    date: { pickerAppearance: 'dayAndTime', displayFormat: 'dd/MM/yyyy HH:mm' },
  },
}
