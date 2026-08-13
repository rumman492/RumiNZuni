import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { COURIER_PROVIDERS } from '@/lib/shipping'

export const Couriers: CollectionConfig = {
  slug: 'couriers',
  labels: {
    singular: 'Courier',
    plural: 'Couriers',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Sales',
    defaultColumns: ['name', 'slug', 'provider', 'active', 'updatedAt'],
    description:
      'Courier names used on orders. Provider stays Manual until a courier API adapter is connected in code — Orders do not need to change.',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Shown on the order and to the customer (e.g. TCS, Leopards, Shop rider)' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Stable id, e.g. tcs or leopard' },
    },
    {
      name: 'provider',
      type: 'select',
      required: true,
      defaultValue: 'manual',
      options: [...COURIER_PROVIDERS],
      admin: {
        description: 'Which future API adapter to use. Keep Manual until credentials and an adapter exist.',
      },
    },
    {
      name: 'trackingUrlTemplate',
      type: 'text',
      admin: {
        description: 'Optional public tracking page. Use {trackingNumber} or {cn}, e.g. https://example.com/track/{trackingNumber}',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: { description: 'Internal — pickup account, city coverage, etc.' },
    },
  ],
}
