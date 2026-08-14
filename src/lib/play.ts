const THEMES = [
  { test: /girl/i, className: 'bg-blush' },
  { test: /boy/i, className: 'bg-sky' },
  { test: /accessor|baby-kids-accessories/i, className: 'bg-mint' },
  { test: /newborn|\/shop\/newborn/i, className: 'bg-lemon' },
  { test: /infant/i, className: 'bg-lemon' },
  { test: /unisex/i, className: 'bg-sand' },
  { test: /footwear|shoe/i, className: 'bg-gold' },
  { test: /handbag|\/shop\/handbags/i, className: 'bg-sand' },
  { test: /perfume|fragrance/i, className: 'bg-gold' },
  { test: /skincare|skin care/i, className: 'bg-mint' },
  { test: /makeup|\/shop\/beauty/i, className: 'bg-blush' },
  { test: /bag/i, className: 'bg-sky' },
  { test: /beauty/i, className: 'bg-blush' },
] as const

export function collectionTheme(title: string, href: string) {
  const haystack = `${title} ${href}`
  return THEMES.find((theme) => theme.test.test(haystack))?.className || 'bg-sand'
}
