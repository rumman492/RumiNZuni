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
      'Add a product: photos, department + category, variants (SKU, size or volume, colour or shade, PKR, stock), then Publish. Kids: age + Boys/Girls for clothing. Women’s: leave age and gender empty. Open Staff guide in the left menu for step-by-step.',
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
            description:
              'Open only the block you need. Kids: fabric and size guide. Women’s: handbags, makeup, skincare, or perfume. Leave unused fields empty.',
          },
          fields: [
            {
              type: 'collapsible',
              label: 'Kids — fabric & care',
              admin: { initCollapsed: true },
              fields: [
            {
              name: 'material',
              type: 'text',
              admin: { description: 'e.g. 100% cotton jersey, lawn with lining. Also used for handbags.' },
            },
            {
              name: 'careInstructions',
              type: 'textarea',
              admin: { description: 'e.g. Machine wash cold. Do not bleach. Dry in shade.' },
            },
            {
              name: 'sizeGuide',
              type: 'relationship',
              relationTo: 'size-guides',
              admin: { description: 'Kids clothing charts. Leave empty for Women’s products.' },
            },
              ],
            },
            {
              type: 'collapsible',
              label: 'Women’s — brand & type',
              admin: { initCollapsed: false },
              fields: [
            {
              name: 'brand',
              type: 'text',
              admin: { description: 'Match Catalog options if you added the brand there.' },
            },
            {
              name: 'productKind',
              type: 'text',
              admin: { description: 'e.g. lipstick, cleanser, Eau de Parfum. Catalog options → Product type.' },
            },
              ],
            },
            {
              type: 'collapsible',
              label: 'Handbags',
              admin: { initCollapsed: true },
              fields: [
            {
              name: 'bagType',
              type: 'text',
              admin: { description: 'e.g. tote, crossbody, clutch. Catalog options → Bag type.' },
            },
            {
              name: 'dimensions',
              type: 'text',
              admin: { description: 'e.g. 30 × 20 × 12 cm' },
            },
            {
              name: 'pattern',
              type: 'text',
              admin: { description: 'e.g. plain, printed' },
            },
            {
              name: 'strapType',
              type: 'text',
              admin: { description: 'e.g. chain, adjustable' },
            },
            {
              name: 'closureType',
              type: 'text',
              admin: { description: 'e.g. zip, magnetic' },
            },
            {
              name: 'compartments',
              type: 'text',
              admin: { description: 'Number of pockets/compartments' },
            },
              ],
            },
            {
              type: 'collapsible',
              label: 'Makeup',
              admin: { initCollapsed: true },
              fields: [
            {
              name: 'shade',
              type: 'text',
              admin: { description: 'Default shade name. Also put shades on variants as Colour.' },
            },
            {
              name: 'finish',
              type: 'text',
              admin: { description: 'e.g. matte, dewy. Catalog options → Finish.' },
            },
            {
              name: 'skinTone',
              type: 'text',
              admin: { description: 'e.g. fair, medium, deep' },
            },
            {
              name: 'formulation',
              type: 'text',
              admin: { description: 'e.g. liquid, cream, powder' },
            },
              ],
            },
            {
              type: 'collapsible',
              label: 'Skincare',
              admin: { initCollapsed: true },
              fields: [
            {
              name: 'skinType',
              type: 'text',
              admin: { description: 'e.g. dry, oily. Catalog options → Skin type.' },
            },
            {
              name: 'skinConcern',
              type: 'text',
              admin: { description: 'e.g. acne, hydration. Catalog options → Skin concern.' },
            },
            {
              name: 'keyIngredients',
              type: 'text',
              admin: { description: 'e.g. niacinamide, hyaluronic acid' },
            },
            {
              name: 'spf',
              type: 'text',
              admin: { description: 'e.g. SPF 50' },
            },
            {
              name: 'volume',
              type: 'text',
              admin: { description: 'e.g. 50 ml. Perfume volume can live here or on the variant size.' },
            },
              ],
            },
            {
              type: 'collapsible',
              label: 'Perfumes',
              admin: { initCollapsed: true },
              fields: [
            {
              name: 'fragranceType',
              type: 'text',
              admin: { description: 'e.g. Eau de Parfum. Catalog options → Fragrance type.' },
            },
            {
              name: 'fragranceFamily',
              type: 'text',
              admin: { description: 'e.g. Floral. Catalog options → Fragrance family.' },
            },
            { name: 'topNotes', type: 'text' },
            { name: 'middleNotes', type: 'text', admin: { description: 'Heart notes' } },
            { name: 'baseNotes', type: 'text' },
            {
              name: 'longevity',
              type: 'text',
              admin: { description: 'e.g. 6–8 hours' },
            },
              ],
            },
            {
              type: 'collapsible',
              label: 'Ingredients & safety (beauty / skincare / perfume)',
              admin: { initCollapsed: true },
              fields: [
            { name: 'ingredients', type: 'textarea' },
            { name: 'usageInstructions', type: 'textarea' },
            { name: 'warnings', type: 'textarea' },
            { name: 'manufacturer', type: 'text' },
            { name: 'countryOfOrigin', type: 'text' },
            {
              name: 'batchExpiry',
              type: 'text',
              admin: { description: 'Optional batch or expiry note. Do not invent claims.' },
            },
              ],
            },
            {
              name: 'tags',
              type: 'relationship',
              relationTo: 'tags',
              hasMany: true,
              filterOptions: { active: { equals: true } },
              admin: { description: 'Configurable in Admin → Tags' },
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
