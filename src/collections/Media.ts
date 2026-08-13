import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Catalog',
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
    staticDir: path.resolve(dirname, '../../media'),
    mimeTypes: ['image/*'],
  },
}
