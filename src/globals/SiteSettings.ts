import type { GlobalConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { PAKISTAN_CITIES } from '@/lib/pakistan'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Store settings',
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Brand',
          fields: [
            { name: 'storeName', type: 'text', required: true, defaultValue: 'RumiNZuni' },
            {
              name: 'tagline',
              type: 'text',
              defaultValue: 'Soft clothes for little explorers',
            },
            { name: 'logo', type: 'upload', relationTo: 'media' },
            {
              name: 'announcement',
              type: 'text',
              defaultValue: 'Cash on delivery across Pakistan · Free shipping over Rs 3,000',
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              name: 'whatsapp',
              type: 'text',
              required: true,
              defaultValue: '03001234567',
              admin: { description: 'Used for order WhatsApp buttons (03XXXXXXXXX)' },
            },
            { name: 'phone', type: 'text', defaultValue: '03001234567' },
            { name: 'email', type: 'email', defaultValue: 'hello@ruminzuni.com' },
            { name: 'instagram', type: 'text' },
            { name: 'facebook', type: 'text' },
          ],
        },
        {
          label: 'Shipping & COD',
          fields: [
            {
              name: 'freeShippingThreshold',
              type: 'number',
              defaultValue: 3000,
              admin: { description: 'Free delivery when subtotal reaches this PKR amount' },
            },
            {
              name: 'defaultShippingFee',
              type: 'number',
              defaultValue: 250,
              admin: { description: 'Fallback shipping fee in PKR' },
            },
            {
              name: 'codFee',
              type: 'number',
              defaultValue: 0,
              admin: { description: 'Optional cash-on-delivery handling fee' },
            },
            {
              name: 'cityShipping',
              type: 'array',
              labels: { singular: 'City rate', plural: 'City rates' },
              fields: [
                {
                  name: 'city',
                  type: 'select',
                  required: true,
                  options: PAKISTAN_CITIES.map((city) => ({ label: city, value: city })),
                },
                { name: 'fee', type: 'number', required: true, min: 0 },
              ],
            },
          ],
        },
        {
          label: 'Homepage',
          fields: [
            {
              name: 'heroTitle',
              type: 'text',
              defaultValue: 'Little outfits, made for everyday play',
            },
            {
              name: 'heroSubtitle',
              type: 'textarea',
              defaultValue:
                'Breathable kids wear for Pakistani weather. Order on cash on delivery — pay when it arrives.',
            },
            { name: 'heroImage', type: 'upload', relationTo: 'media' },
            { name: 'heroCta', type: 'text', defaultValue: 'Shop new arrivals' },
          ],
        },
      ],
    },
  ],
}
