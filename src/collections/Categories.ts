import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { assignSlug } from '@/lib/slug'

const seoFields = [
  { name: 'title', type: 'text' as const, admin: { description: 'Defaults to the category name' } },
  { name: 'description', type: 'textarea' as const },
  { name: 'noindex', type: 'checkbox' as const, defaultValue: false },
  { name: 'ogImage', type: 'upload' as const, relationTo: 'media' as const },
]

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    group: 'Catalog',
    defaultColumns: ['name', 'slug', 'department', 'showInNavigation', 'sortOrder', 'active'],
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
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Used in /shop/slug URLs' },
    },
    { name: 'description', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      admin: { description: 'Controls which shop filters appear for products in this category.' },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
      admin: { description: 'Optional parent, e.g. Handbags under Women’s.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'active', type: 'checkbox', defaultValue: true },
        {
          name: 'showInNavigation',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Main storefront nav. Boys/Girls stay gender links, not this list.' },
        },
        { name: 'sortOrder', type: 'number', defaultValue: 0 },
      ],
    },
    { type: 'group', name: 'seo', fields: seoFields },
  ],
}
