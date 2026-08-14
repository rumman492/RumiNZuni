import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { assignSlug } from '@/lib/slug'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    description:
      'Edit Shipping, Returns, and Contact by using slugs shipping, returns, and contact. Leave empty to keep the built-in text. Staff can change policy copy here without a developer.',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [({ data }) => assignSlug(data)],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Use shipping, returns, or contact to replace those storefront pages.' },
    },
    { name: 'content', type: 'richText', required: true },
  ],
}
