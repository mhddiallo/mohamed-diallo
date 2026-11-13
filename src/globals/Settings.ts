import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: { fr: 'Réglages du site', en: 'Site settings' },
  admin: { group: { fr: 'Pages', en: 'Pages' } },
  access: { read: () => true },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      defaultValue: 'Mohamed Diallo',
      label: { fr: 'Nom du site', en: 'Site name' },
    },
    {
      name: 'kicker',
      type: 'text',
      localized: true,
      label: { fr: 'Étiquette (au-dessus du nom)', en: 'Label (above the name)' },
      admin: { description: { fr: 'Ex. : Ingénieur logiciel · Dakar, Sénégal', en: 'E.g. Software engineer · Dakar, Senegal' } },
    },
    {
      name: 'tagline',
      type: 'text',
      localized: true,
      label: { fr: 'Phrase d’accroche (page d’accueil)', en: 'Tagline (home page)' },
    },
    {
      name: 'intro',
      type: 'textarea',
      localized: true,
      label: { fr: 'Introduction (page d’accueil)', en: 'Introduction (home page)' },
    },
    {
      name: 'manifesto',
      type: 'textarea',
      localized: true,
      label: { fr: 'Phrase manifeste (accueil)', en: 'Manifesto line (home page)' },
      admin: {
        description: {
          fr: 'Une phrase forte, affichée en très grand sur l’accueil.',
          en: 'A strong sentence, shown very large on the home page.',
        },
      },
    },
    {
      name: 'footerMessage',
      type: 'text',
      localized: true,
      label: { fr: 'Message du pied de page', en: 'Footer message' },
      admin: { description: { fr: 'Ex. : À bientôt, ba beneen yoon.', en: 'E.g. See you soon, ba beneen yoon.' } },
    },
    {
      name: 'socials',
      type: 'array',
      label: { fr: 'Liens (réseaux, e-mail…)', en: 'Links (socials, email…)' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, label: { fr: 'Libellé', en: 'Label' } },
            {
              name: 'url',
              type: 'text',
              required: true,
              label: 'URL',
              admin: { description: 'https://… ou mailto:…' },
            },
          ],
        },
      ],
    },
  ],
}
