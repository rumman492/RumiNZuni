type MediaLike = {
  url?: string | null
  filename?: string | null
} | null

export function mediaUrl(media: MediaLike): string | null {
  if (!media) return null
  if (media.url) return media.url
  if (media.filename) return `/api/media/file/${media.filename}`
  return null
}
