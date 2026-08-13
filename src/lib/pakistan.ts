export const PAKISTAN_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Bahawalpur',
  'Sargodha',
  'Gujrat',
  'Sahiwal',
  'Abbottabad',
  'Rahim Yar Khan',
  'Sukkur',
  'Larkana',
  'Mardan',
  'Okara',
  'Sheikhupura',
  'Jhelum',
  'Dera Ghazi Khan',
  'Wah Cantt',
  'Mirpur',
  'Other',
] as const

export type PakistanCity = (typeof PAKISTAN_CITIES)[number]

export const PRODUCT_SIZES = [
  { label: 'Newborn', value: 'newborn' },
  { label: '0-3 months', value: '0-3m' },
  { label: '3-6 months', value: '3-6m' },
  { label: '6-9 months', value: '6-9m' },
  { label: '9-12 months', value: '9-12m' },
  { label: '12-18 months', value: '12-18m' },
  { label: '18-24 months', value: '18-24m' },
  { label: '2 years', value: '2y' },
  { label: '3 years', value: '3y' },
  { label: '4 years', value: '4y' },
  { label: '5 years', value: '5y' },
  { label: '6 years', value: '6y' },
  { label: '7-8 years', value: '7-8y' },
  { label: '9-10 years', value: '9-10y' },
  { label: '11-12 years', value: '11-12y' },
] as const

export function formatProductSize(value: string | null | undefined) {
  return PRODUCT_SIZES.find((size) => size.value === value)?.label || value || ''
}

export const PK_PHONE_REGEX = /^(\+92|0)?3\d{9}$/

export function normalizePkPhone(phone: string): string {
  const digits = phone.replace(/[\s-]/g, '')
  if (digits.startsWith('+92')) return `0${digits.slice(3)}`
  if (digits.startsWith('92') && digits.length === 12) return `0${digits.slice(2)}`
  return digits
}

export function toWhatsAppNumber(phone: string): string {
  const local = normalizePkPhone(phone)
  if (local.startsWith('0')) return `92${local.slice(1)}`
  return local
}

export function formatPkr(amount: number): string {
  return `Rs ${Math.round(amount).toLocaleString('en-PK')}`
}

export function isValidPkPhone(phone: string): boolean {
  return PK_PHONE_REGEX.test(phone.replace(/[\s-]/g, ''))
}
