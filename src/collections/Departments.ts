import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { assignSlug } from '@/lib/slug'

export const Departments: CollectionConfig = {
  slug: 'departments',
  admin: {
    useAsTitle: 'name',
    group: 'Catalog',
    defaultColumns: ['name', 'slug', 'showInNavigation', 'sortOrder'],
    description:
      'Kids Wear, Accessories, Footwear, Women’s. Tick the filter boxes (age, size, colour…) — those switches control the shop. Staff can add a department without a developer.',
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
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'audience',
      type: 'select',
      required: true,
      defaultValue: 'kids',
      options: [
        { label: 'Kids', value: 'kids' },
        { label: 'Women', value: 'women' },
      ],
    },
    {
      name: 'sizeKind',
      type: 'select',
      required: true,
      defaultValue: 'clothing',
      options: [
        { label: 'Clothing sizes', value: 'clothing' },
        { label: 'Footwear sizes', value: 'footwear' },
        { label: 'No size chart', value: 'none' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'usesGender', type: 'checkbox', defaultValue: true },
        { name: 'usesAge', type: 'checkbox', defaultValue: true },
        { name: 'usesSize', type: 'checkbox', defaultValue: true },
        { name: 'usesHeight', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'usesColor', type: 'checkbox', defaultValue: true },
        { name: 'usesBrand', type: 'checkbox', defaultValue: false },
        { name: 'usesBagType', type: 'checkbox', defaultValue: false },
        { name: 'usesProductKind', type: 'checkbox', defaultValue: false },
        { name: 'usesSkinType', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'showInNavigation',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Show this department in the storefront header/footer.' },
    },
    {
      name: 'storefrontVisible',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Off hides the department from the shop until you are ready.' },
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
    {
      type: 'group',
      name: 'seo',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'noindex', type: 'checkbox', defaultValue: false },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
