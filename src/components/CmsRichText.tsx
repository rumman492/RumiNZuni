import { RichText } from '@payloadcms/richtext-lexical/react'

export function CmsRichText({ content }: { content: unknown }) {
  if (!content) return null
  return (
    <div className="space-y-4 [&_a]:text-coral [&_a]:font-bold">
      <RichText data={content as never} />
    </div>
  )
}
