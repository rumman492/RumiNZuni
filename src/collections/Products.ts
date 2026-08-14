import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    group: 'Catalog',
    defaultColumns: ['title', 'category', 'sortPriority', 'gender', '_status', 'updatedAt'],
    listSearchableFields: ['title', 'slug'],
    description: 'Kids-wear catalog. Existing products stay valid — new merchandising fields are optional.',
  },
  defaultSort: '-sortPriority',
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return {
        _status: {
          equals: 'published',
        },
      }
    },
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Product',
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
              required: true,
            },
            {
              name: 'details',
              type: 'richText',
            },
            {
              name: 'images',
              type: 'array',
              minRows: 0,
              labels: { singular: 'Image', plural: 'Images' },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'category',
                  type: 'relationship',
                  relationTo: 'categories',
                  required: true,
                },
                {
                  name: 'gender',
                  type: 'select',
                  required: true,
                  defaultValue: 'unisex',
                  options: [
                    { label: 'Boys', value: 'boys' },
                    { label: 'Girls', value: 'girls' },
                    { label: 'Unisex', value: 'unisex' },
                  ],
                },
                {
                  name: 'ageGroup',
                  type: 'relationship',
                  relationTo: 'age-groups',
                  required: true,
                  admin: {
                    description:
                      'Primary merchandising band. Shop filters also match by variant height, so mixed-size products still appear in the right groups.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Details',
          admin: {
            description: 'Fabric, care, tags, and size guide. All optional so older products keep working.',
          },
          fields: [
            {
              name: 'material',
              type: 'text',
              admin: { description: 'e.g. 100% cotton jersey, lawn with lining' },
            },
            {
              name: 'careInstructions',
              type: 'textarea',
              admin: { description: 'e.g. Machine wash cold. Do not bleach. Dry in shade.' },
            },
            {
              name: 'tags',
              type: 'relationship',
              relationTo: 'tags',
              hasMany: true,
              filterOptions: { active: { equals: true } },
              admin: { description: 'Configurable in Admin → Tags' },
            },
            {
              name: 'sizeGuide',
              type: 'relationship',
              relationTo: 'size-guides',
              admin: { description: 'Configurable in Admin → Size guides' },
            },
          ],
        },
        {
          label: 'Merchandising',
          fields: [
            {
              name: 'featured',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'sortPriority',
              type: 'number',
              defaultValue: 0,
              index: true,
              admin: {
                description: 'Higher numbers appear first in the shop. 0 is fine for most products.',
              },
            },
            {
              name: 'relatedProducts',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
              maxRows: 8,
              filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
              admin: { description: 'Shown at the bottom of the product page' },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              type: 'group',
              name: 'seo',
              label: false,
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  admin: { description: 'Defaults to the product title' },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  admin: { description: 'Defaults to the short product description' },
                },
              ],
            },
          ],
        },
        {
          label: 'Variants',
          fields: [
            {
              name: 'variants',
              type: 'array',
              required: true,
              minRows: 1,
              labels: { singular: 'Variant', plural: 'Variants' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'sku',
                      type: 'text',
                      required: true,
                    },
                    {
                      name: 'size',
                      type: 'text',
                      required: true,
                      admin: {
                        description:
                          'Size code from Admin → Sizes (e.g. 6y). Height bands live on that size — add 13-14y later without changing this field.',
                      },
                    },
                    {
                      name: 'color',
                      type: 'text',
                      required: true,
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'price',
                      type: 'number',
                      required: true,
                      min: 0,
                      admin: { description: 'Price in PKR' },
                    },
                    {
                      name: 'compareAtPrice',
                      type: 'number',
                      min: 0,
                      admin: { description: 'Optional original price for sale badge' },
                    },
                    {
                      name: 'stock',
                      type: 'number',
                      required: true,
                      min: 0,
                      defaultValue: 0,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
