export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function assignSlug(data: { slug?: string | null; title?: string | null; name?: string | null } | undefined) {
  if (!data) return data
  if (data.slug && String(data.slug).trim()) return data
  const source = data.title || data.name
  if (typeof source === 'string' && source.trim()) {
    data.slug = slugify(source)
  }
  return data
}
