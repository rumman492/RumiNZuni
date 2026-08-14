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
            { name: 'storeName', type: 'text', required: true, defaultValue: 'Rumi & Zuni' },
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
              admin: {
                description:
                  'Pakistani mobile for order WhatsApp buttons (03XXXXXXXXX). Leave empty until you have the real shop number.',
              },
            },
            {
              name: 'phone',
              type: 'text',
              admin: { description: 'Public shop phone. Leave empty if you only use WhatsApp.' },
            },
            {
              name: 'email',
              type: 'email',
              admin: { description: 'Public shop email. Leave empty until the real inbox exists.' },
            },
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
          admin: {
            description:
              'Controls the storefront home page. Existing hero fields stay as they are; leave new blocks empty to keep the built-in fallbacks.',
          },
          fields: [
            {
              type: 'collapsible',
              label: 'Hero',
              admin: { initCollapsed: false },
              fields: [
                {
                  name: 'heroEyebrow',
                  type: 'text',
                  defaultValue: 'Pakistan · Cash on delivery',
                },
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
                {
                  type: 'row',
                  fields: [
                    { name: 'heroCta', type: 'text', defaultValue: 'Shop new arrivals' },
                    {
                      name: 'heroCtaLink',
                      type: 'text',
                      defaultValue: '/shop',
                      admin: { description: 'Storefront path, e.g. /shop or /shop/girls' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'heroSecondaryCta',
                      type: 'text',
                      defaultValue: 'How COD works',
                    },
                    {
                      name: 'heroSecondaryCtaLink',
                      type: 'text',
                      defaultValue: '/shipping',
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'heroOverlayTitle',
                      type: 'text',
                      defaultValue: 'Ages newborn – 12',
                      admin: { description: 'Shown when there is no hero image' },
                    },
                    {
                      name: 'heroOverlaySubtitle',
                      type: 'text',
                      defaultValue: 'Boys · Girls',
                    },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Promo banner',
              admin: { initCollapsed: true },
              fields: [
                {
                  name: 'homeBannerTitle',
                  type: 'text',
                  admin: { description: 'Leave empty to hide the banner' },
                },
                { name: 'homeBannerCopy', type: 'textarea' },
                {
                  type: 'row',
                  fields: [
                    { name: 'homeBannerCta', type: 'text' },
                    { name: 'homeBannerCtaLink', type: 'text', defaultValue: '/shop' },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Featured collections',
              admin: { initCollapsed: false },
              fields: [
                {
                  name: 'homeCollections',
                  type: 'array',
                  labels: { singular: 'Collection', plural: 'Collections' },
                  admin: {
                    description: 'Empty uses Boys / Girls / Accessories / Footwear. Fill this to replace those cards.',
                  },
                  fields: [
                    { name: 'title', type: 'text', required: true },
                    { name: 'copy', type: 'textarea' },
                    {
                      name: 'category',
                      type: 'relationship',
                      relationTo: 'categories',
                      admin: { description: 'Optional. Links to /shop/{slug} unless you set a custom path.' },
                    },
                    {
                      name: 'href',
                      type: 'text',
                      admin: { description: 'Optional custom path, e.g. /shop/boys' },
                    },
                    { name: 'image', type: 'upload', relationTo: 'media' },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Featured products',
              admin: { initCollapsed: false },
              fields: [
                {
                  name: 'featuredEyebrow',
                  type: 'text',
                  defaultValue: 'Featured',
                },
                {
                  name: 'featuredHeading',
                  type: 'text',
                  defaultValue: 'Little bestsellers',
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'featuredCta', type: 'text', defaultValue: 'View all' },
                    { name: 'featuredCtaLink', type: 'text', defaultValue: '/shop' },
                  ],
                },
                {
                  name: 'featuredEmptyMessage',
                  type: 'textarea',
                  defaultValue:
                    'Products will appear here after you seed the catalog or add items in the admin panel.',
                },
                {
                  name: 'homeFeaturedProducts',
                  type: 'relationship',
                  relationTo: 'products',
                  hasMany: true,
                  maxRows: 8,
                  admin: {
                    description:
                      'Optional. Empty shows products marked Featured, then newest published items.',
                  },
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Promises',
              admin: { initCollapsed: true },
              fields: [
                {
                  name: 'homePromos',
                  type: 'array',
                  labels: { singular: 'Promise', plural: 'Promises' },
                  maxRows: 4,
                  admin: { description: 'Empty keeps Cash on delivery / Pakistan-wide / Easy exchanges.' },
                  fields: [
                    {
                      name: 'icon',
                      type: 'select',
                      defaultValue: 'cod',
                      options: [
                        { label: 'Cash on delivery', value: 'cod' },
                        { label: 'Shipping', value: 'shipping' },
                        { label: 'Returns', value: 'returns' },
                        { label: 'Quality', value: 'sparkles' },
                      ],
                    },
                    { name: 'title', type: 'text', required: true },
                    { name: 'copy', type: 'textarea', required: true },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Story / marketing',
              admin: { initCollapsed: true },
              fields: [
                {
                  name: 'homeStoryTitle',
                  type: 'text',
                  admin: { description: 'Leave empty to hide this block' },
                },
                { name: 'homeStoryEyebrow', type: 'text' },
                { name: 'homeStoryBody', type: 'textarea' },
                { name: 'homeStoryImage', type: 'upload', relationTo: 'media' },
                {
                  type: 'row',
                  fields: [
                    { name: 'homeStoryCta', type: 'text' },
                    { name: 'homeStoryCtaLink', type: 'text', defaultValue: '/contact' },
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
