import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { assignSlug } from '@/lib/slug'

export const CATALOG_OPTION_KINDS = [
  { label: 'Bag type', value: 'bag-type' },
  { label: 'Skin type', value: 'skin-type' },
  { label: 'Skin concern', value: 'skin-concern' },
  { label: 'Fragrance family', value: 'fragrance-family' },
  { label: 'Fragrance type', value: 'fragrance-type' },
  { label: 'Finish', value: 'finish' },
  { label: 'Skin tone', value: 'skin-tone' },
  { label: 'Product type', value: 'product-kind' },
] as const

export const CatalogOptions: CollectionConfig = {
  slug: 'catalog-options',
  labels: { singular: 'Catalog option', plural: 'Catalog options' },
  admin: {
    useAsTitle: 'name',
    group: 'Catalog',
    defaultColumns: ['name', 'kind', 'active', 'sortOrder'],
    description:
      'Reusable Women’s values (skin type, fragrance family, bag type). Type the same wording on the product so shop filters group. Add new brands and types here without a developer.',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  defaultSort: 'sortOrder',
  hooks: {
    beforeValidate: [({ data }) => assignSlug(data)],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true, index: true },
    {
      name: 'kind',
      type: 'select',
      required: true,
      options: [...CATALOG_OPTION_KINDS],
    },
    { name: 'active', type: 'checkbox', defaultValue: true },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
  ],
}
