import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    group: 'Catalog',
    defaultColumns: ['title', 'category', 'sortPriority', 'gender', '_status', 'updatedAt'],
    listSearchableFields: ['title', 'slug'],
    description: 'Catalog. Department controls which filters apply. Gender is Boys/Girls only — leave blank for accessories that do not need it. Legacy Unisex stays in the database but is never shown in the shop.',
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
                  name: 'department',
                  type: 'relationship',
                  relationTo: 'departments',
                  admin: {
                    description: 'Kids Wear, Accessories, Footwear, or Women’s. Drives shop filters.',
                  },
                },
                {
                  name: 'category',
                  type: 'relationship',
                  relationTo: 'categories',
                  required: true,
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'gender',
                  type: 'select',
                  options: [
                    { label: 'Boys', value: 'boys' },
                    { label: 'Girls', value: 'girls' },
                  ],
                  admin: {
                    description:
                      'Required for clothing when it is boys or girls only. Leave empty for bibs, bags, and other extras. Do not use Unisex — it is removed from the shop.',
                  },
                },
                {
                  name: 'ageGroup',
                  type: 'relationship',
                  relationTo: 'age-groups',
                  admin: {
                    description:
                      'Kids products only. Leave empty for Women’s handbags, beauty, and skincare.',
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
              name: 'brand',
              type: 'text',
              admin: { description: 'Women’s beauty/skincare. Optional elsewhere.' },
            },
            {
              name: 'productKind',
              type: 'text',
              admin: { description: 'e.g. lipstick, cleanser, serum' },
            },
            {
              name: 'bagType',
              type: 'text',
              admin: { description: 'e.g. tote, crossbody, clutch' },
            },
            {
              name: 'skinType',
              type: 'text',
              admin: { description: 'e.g. dry, oily, combination' },
            },
            {
              name: 'ingredients',
              type: 'textarea',
            },
            {
              name: 'volume',
              type: 'text',
              admin: { description: 'e.g. 50 ml' },
            },
            {
              name: 'dimensions',
              type: 'text',
              admin: { description: 'Bag size, e.g. 30 × 20 × 12 cm' },
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
                          'Size code from Admin → Sizes. Clothing uses 6y; footwear uses shoe codes (e.g. eu-28). Handbags/beauty can use onesize.',
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
