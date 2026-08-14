import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

export const SizeGuides: CollectionConfig = {
  slug: 'size-guides',
  labels: {
    singular: 'Size guide',
    plural: 'Size guides',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Catalog',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    description: 'Measurement charts you can attach to products. Newborn and kids usually need different guides.',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Short note shown above the chart, e.g. how to measure chest' },
    },
    {
      name: 'measurements',
      type: 'array',
      labels: { singular: 'Row', plural: 'Rows' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'size',
              type: 'text',
              required: true,
              admin: { description: 'Size code from Admin → Sizes, e.g. 6y' },
            },
            { name: 'age', type: 'text', admin: { description: 'e.g. 3–4 years' } },
            { name: 'chest', type: 'text', admin: { description: 'e.g. 56 cm' } },
            { name: 'length', type: 'text' },
            { name: 'waist', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: { description: 'Fit notes: relaxed, true to size, order up if between sizes' },
    },
  ],
}
