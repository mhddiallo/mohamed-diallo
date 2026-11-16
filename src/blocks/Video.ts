import type { Block } from 'payload'
import { parseVideoUrl } from '../lib/video'

export const VideoBlock: Block = {
  slug: 'video',
  labels: {
    singular: { fr: 'Vidéo', en: 'Video' },
    plural: { fr: 'Vidéos', en: 'Videos' },
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      label: { fr: 'Lien YouTube ou Vimeo', en: 'YouTube or Vimeo link' },
      admin: {
        placeholder: 'https://www.youtube.com/watch?v=…',
        description: {
          fr: 'Collez le lien de la vidéo. Une vidéo YouTube « non répertoriée » fonctionne aussi.',
          en: 'Paste the video link. An “unlisted” YouTube video works too.',
        },
      },
      validate: (value: string | null | undefined) =>
        !value || parseVideoUrl(value) ? true : 'Lien YouTube ou Vimeo non reconnu.',
    },
    {
      name: 'caption',
      type: 'text',
      label: { fr: 'Légende (facultatif)', en: 'Caption (optional)' },
    },
  ],
}
