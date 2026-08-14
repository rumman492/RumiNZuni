import type { GlobalConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { BRAND, FEATURED, HERO, HOME_BANNER } from '@/lib/brandCopy'
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
              defaultValue: BRAND.tagline,
            },
            { name: 'logo', type: 'upload', relationTo: 'media' },
            {
              name: 'announcement',
              type: 'text',
              defaultValue: BRAND.announcement,
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
          label: 'Navigation',
          admin: {
            description: 'Empty uses the built-in Shop / Kids Wear (dropdown) / Women’s (dropdown) / Size Guide / Track links.',
          },
          fields: [
            {
              name: 'navLinks',
              type: 'array',
              labels: { singular: 'Nav link', plural: 'Header links' },
              admin: {
                description:
                  'Leave empty for the built-in menu with Kids Wear and Women’s dropdowns. Extra paths are added as top-level links. Examples: /shop, /shop/boys, /track',
              },
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'href', type: 'text', required: true },
              ],
            },
            {
              name: 'footerShopLinks',
              type: 'array',
              labels: { singular: 'Footer link', plural: 'Footer shop links' },
              admin: { description: 'Shop column in the footer. Empty keeps the built-in list.' },
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'href', type: 'text', required: true },
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
                  defaultValue: HERO.eyebrow,
                },
                {
                  name: 'heroTitle',
                  type: 'text',
                  defaultValue: HERO.title,
                },
                {
                  name: 'heroSubtitle',
                  type: 'textarea',
                  defaultValue: HERO.subtitle,
                },
                { name: 'heroImage', type: 'upload', relationTo: 'media' },
                {
                  type: 'row',
                  fields: [
                    { name: 'heroCta', type: 'text', defaultValue: HERO.cta },
                    {
                      name: 'heroCtaLink',
                      type: 'text',
                      defaultValue: HERO.ctaLink,
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
                      defaultValue: HERO.secondaryCta,
                    },
                    {
                      name: 'heroSecondaryCtaLink',
                      type: 'text',
                      defaultValue: HERO.secondaryCtaLink,
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'heroOverlayTitle',
                      type: 'text',
                      defaultValue: HERO.overlayTitle,
                      admin: { description: 'Shown when there is no hero image' },
                    },
                    {
                      name: 'heroOverlaySubtitle',
                      type: 'text',
                      defaultValue: HERO.overlaySubtitle,
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
                  admin: { description: 'Leave empty to use the built-in “Find their next favourite” banner.' },
                },
                { name: 'homeBannerCopy', type: 'textarea' },
                {
                  type: 'row',
                  fields: [
                    { name: 'homeBannerCta', type: 'text' },
                    { name: 'homeBannerCtaLink', type: 'text', defaultValue: HOME_BANNER.ctaLink },
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
                  defaultValue: FEATURED.eyebrow,
                },
                {
                  name: 'featuredHeading',
                  type: 'text',
                  defaultValue: FEATURED.heading,
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'featuredCta', type: 'text', defaultValue: FEATURED.cta },
                    { name: 'featuredCtaLink', type: 'text', defaultValue: FEATURED.ctaLink },
                  ],
                },
                {
                  name: 'featuredEmptyMessage',
                  type: 'textarea',
                  defaultValue: FEATURED.emptyMessage,
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
