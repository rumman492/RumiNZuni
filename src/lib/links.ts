/** Allow only in-store paths so CMS links cannot point off-site or run scripts. */
export function storefrontHref(value?: string | null, fallback = '/') {
  const trimmed = value?.trim()
  if (trimmed && trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('://')) {
    return trimmed
  }
  return fallback
}
