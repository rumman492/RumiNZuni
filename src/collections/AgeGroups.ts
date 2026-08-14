import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { assignSlug } from '@/lib/slug'

export const AgeGroups: CollectionConfig = {
  slug: 'age-groups',
  labels: { singular: 'Age group', plural: 'Age groups' },
  admin: {
    useAsTitle: 'name',
    group: 'Catalog',
    defaultColumns: ['name', 'slug', 'storefrontVisible', 'sortOrder'],
    description:
      'Merchandising bands for the shop. Height in cm drives which products match. Turn on storefront to show Pre-Teen or Teen later — no code change.',
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
    { name: 'blurb', type: 'textarea' },
    {
      name: 'storefrontVisible',
      type: 'checkbox',
      defaultValue: true,
      label: 'Active',
      admin: { description: 'Show in shop age filters. Leave Pre-Teen and Teen off until you stock them.' },
    },
    {
      name: 'showInNavigation',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Optional extra nav link. Main shop nav uses Boys/Girls and departments, not age groups.' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Lower numbers appear first in shop filters.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'heightMinCm',
          type: 'number',
          required: true,
          min: 30,
          admin: { description: 'Typical shortest height (cm) for this band' },
        },
        {
          name: 'heightMaxCm',
          type: 'number',
          required: true,
          min: 30,
          admin: { description: 'Typical tallest height (cm) for this band' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'ageMinMonths', type: 'number', min: 0, admin: { description: 'Optional age hint (months)' } },
        { name: 'ageMaxMonths', type: 'number', min: 0, admin: { description: 'Optional age hint (months)' } },
      ],
    },
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
