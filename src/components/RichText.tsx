import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

export function RichText({ data, className = 'prose' }: { data: unknown; className?: string }) {
  if (!data || typeof data !== 'object' || !('root' in data)) return null
  return (
    <div className={className}>
      <LexicalRichText data={data as SerializedEditorState} />
    </div>
  )
}
