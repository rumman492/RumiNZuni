import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { assignSlug } from '@/lib/slug'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    group: 'Catalog',
    defaultColumns: ['title', 'category', 'sortPriority', 'gender', '_status', 'updatedAt'],
    listSearchableFields: ['title', 'slug'],
    description:
      'Add a product: pick Department + Category, upload photos, add size/colour/price/stock variants, then Publish. Leave Gender empty for bibs and bags. Tick Featured to pin it on the shop. Staff do not need a developer for new products.',
  },
  defaultSort: '-sortPriority',
  hooks: {
    beforeValidate: [({ data }) => assignSlug(data)],
  },
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
              unique: true,
              index: true,
              admin: { description: 'Leave empty — it is filled from the title. Used in /product/… URLs.' },
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
              name: 'pattern',
              type: 'text',
              admin: { description: 'Handbags. e.g. plain, printed' },
            },
            {
              name: 'strapType',
              type: 'text',
              admin: { description: 'Handbags. e.g. chain, adjustable' },
            },
            {
              name: 'closureType',
              type: 'text',
              admin: { description: 'Handbags. e.g. zip, magnetic' },
            },
            {
              name: 'compartments',
              type: 'text',
              admin: { description: 'Handbags. Number of pockets/compartments' },
            },
            {
              name: 'shade',
              type: 'text',
              admin: { description: 'Makeup shade name. Variant colour can also be the shade.' },
            },
            {
              name: 'finish',
              type: 'text',
              admin: { description: 'Makeup. e.g. matte, dewy. Add values in Catalog options.' },
            },
            {
              name: 'skinTone',
              type: 'text',
              admin: { description: 'Makeup. e.g. fair, medium, deep' },
            },
            {
              name: 'formulation',
              type: 'text',
              admin: { description: 'Makeup. e.g. liquid, cream, powder' },
            },
            {
              name: 'skinConcern',
              type: 'text',
              admin: { description: 'Skincare. e.g. acne, hydration. Catalog options → Skin concern.' },
            },
            {
              name: 'keyIngredients',
              type: 'text',
              admin: { description: 'Skincare. e.g. niacinamide, hyaluronic acid' },
            },
            {
              name: 'spf',
              type: 'text',
              admin: { description: 'Skincare. e.g. SPF 50' },
            },
            {
              name: 'fragranceType',
              type: 'text',
              admin: { description: 'Perfumes. e.g. Eau de Parfum' },
            },
            {
              name: 'fragranceFamily',
              type: 'text',
              admin: { description: 'Perfumes. e.g. Floral. Catalog options → Fragrance family.' },
            },
            {
              name: 'topNotes',
              type: 'text',
            },
            {
              name: 'middleNotes',
              type: 'text',
            },
            {
              name: 'baseNotes',
              type: 'text',
            },
            {
              name: 'longevity',
              type: 'text',
              admin: { description: 'Perfumes. e.g. 6–8 hours' },
            },
            {
              name: 'usageInstructions',
              type: 'textarea',
            },
            {
              name: 'warnings',
              type: 'textarea',
            },
            {
              name: 'manufacturer',
              type: 'text',
            },
            {
              name: 'countryOfOrigin',
              type: 'text',
            },
            {
              name: 'batchExpiry',
              type: 'text',
              admin: { description: 'Optional batch or expiry note. Do not invent claims.' },
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
                          'Kids: size code from Admin → Sizes. Makeup: onesize. Perfume: volume e.g. 50ml. Handbags: onesize.',
                      },
                    },
                    {
                      name: 'color',
                      type: 'text',
                      required: true,
                      admin: { description: 'Kids colour, bag colour, or makeup shade name.' },
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
                {
                  name: 'shadeCode',
                  type: 'text',
                  admin: { description: 'Optional makeup shade code. Leave empty for kids wear.' },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
