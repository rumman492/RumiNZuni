import path from 'path'
import { APIError, type CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    group: 'Catalog',
    description:
      'Upload product photos here (JPG/PNG/WebP, 5 MB or smaller). Then attach them on the product. Staff can replace sample photos anytime.',
  },
  hooks: {
    beforeValidate: [
      ({ req }) => {
        const file = req.file
        if (file && file.size > MAX_IMAGE_BYTES) {
          throw new APIError('Images must be 5 MB or smaller.', 400)
        }
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    // Local disk for development (and production until MEDIA_STORAGE=s3).
    // The S3 plugin disables this directory when object storage is enabled.
    staticDir: process.env.MEDIA_DIR || path.resolve(process.cwd(), 'media'),
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
    pasteURL: false,
    modifyResponseHeaders: ({ headers }) => {
      headers.set('X-Content-Type-Options', 'nosniff')
      headers.set('X-Robots-Tag', 'noindex')
      return headers
    },
  },
}
