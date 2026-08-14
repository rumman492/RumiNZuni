const THEMES = [
  { test: /girl/i, className: 'bg-blush' },
  { test: /boy/i, className: 'bg-sky' },
  { test: /newborn|baby|infant/i, className: 'bg-lemon' },
  { test: /unisex/i, className: 'bg-mint' },
  { test: /footwear|shoe/i, className: 'bg-gold' },
  { test: /handbag|\/shop\/handbags/i, className: 'bg-sand' },
  { test: /perfume|fragrance/i, className: 'bg-gold' },
  { test: /skincare|skin care/i, className: 'bg-mint' },
  { test: /makeup|\/shop\/beauty/i, className: 'bg-blush' },
  { test: /bag/i, className: 'bg-sky' },
  { test: /beauty/i, className: 'bg-blush' },
  { test: /accessor/i, className: 'bg-mint' },
] as const

export function collectionTheme(title: string, href: string) {
  const haystack = `${title} ${href}`
  return THEMES.find((theme) => theme.test.test(haystack))?.className || 'bg-sand'
}
