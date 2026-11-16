import {
  RichText as LexicalRichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { VideoEmbed } from './VideoEmbed'

type Props = { data: unknown; className?: string; locale?: string }

export function RichText({ data, className = 'prose', locale = 'en' }: Props) {
  if (!data || typeof data !== 'object' || !('root' in data)) return null

  const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
    ...defaultConverters,
    blocks: {
      video: ({ node }: { node: { fields: { url: string; caption?: string | null } } }) => (
        <VideoEmbed
          url={node.fields.url}
          caption={node.fields.caption}
          playLabel={locale === 'fr' ? 'Lire la vidéo' : 'Play video'}
        />
      ),
    },
  })

  return (
    <div className={className}>
      <LexicalRichText data={data as SerializedEditorState} converters={converters} />
    </div>
  )
}
