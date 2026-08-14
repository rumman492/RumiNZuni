import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

export const Sizes: CollectionConfig = {
  slug: 'sizes',
  labels: { singular: 'Size', plural: 'Sizes' },
  admin: {
    useAsTitle: 'label',
    group: 'Catalog',
    defaultColumns: ['label', 'code', 'heightMinCm', 'heightMaxCm', 'storefrontVisible', 'sortOrder'],
    description:
      'Garment sizes keyed by height in cm. Add 13–14Y / 14–16Y here and tick storefront when you start selling them. Variant size codes on products stay the same.',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  defaultSort: 'sortOrder',
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Stable code stored on variants, e.g. 6y or 0-3m. Do not rename after products use it.' },
    },
    { name: 'label', type: 'text', required: true, admin: { description: 'Shop label, e.g. 6–7 years' } },
    { name: 'ageLabel', type: 'text', admin: { description: 'Friendly age band shown on Find my size' } },
    {
      name: 'storefrontVisible',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Hide sizes from the shop until you stock them (Pre-Teen / Teen).' },
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
    {
      type: 'row',
      fields: [
        { name: 'heightMinCm', type: 'number', required: true, min: 30, admin: { description: 'Min height cm' } },
        { name: 'heightMaxCm', type: 'number', required: true, min: 30, admin: { description: 'Max height cm' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'chestMinCm', type: 'number', min: 0 },
        { name: 'chestMaxCm', type: 'number', min: 0 },
        { name: 'waistMinCm', type: 'number', min: 0 },
        { name: 'waistMaxCm', type: 'number', min: 0 },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'ageMinMonths', type: 'number', min: 0, admin: { description: 'Age hint only' } },
        { name: 'ageMaxMonths', type: 'number', min: 0 },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'eu', type: 'text', admin: { description: 'EU / height size, e.g. 116' } },
        { name: 'uk', type: 'text', admin: { description: 'UK label' } },
        { name: 'us', type: 'text', admin: { description: 'US label' } },
      ],
    },
    {
      name: 'ageGroups',
      type: 'relationship',
      relationTo: 'age-groups',
      hasMany: true,
      admin: { description: 'Which shop age bands this size belongs to' },
    },
  ],
}
