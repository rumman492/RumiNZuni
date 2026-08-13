const THEMES = [
  { test: /girl/i, className: 'bg-blush' },
  { test: /boy/i, className: 'bg-sky' },
  { test: /newborn|baby|infant/i, className: 'bg-lemon' },
  { test: /unisex/i, className: 'bg-mint' },
] as const

export function collectionTheme(title: string, href: string) {
  const haystack = `${title} ${href}`
  return THEMES.find((theme) => theme.test.test(haystack))?.className || 'bg-sand'
}
