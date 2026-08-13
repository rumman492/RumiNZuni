import { s3Storage } from '@payloadcms/storage-s3'
import type { Plugin } from 'payload'

function readEnv(name: string) {
  const value = process.env[name]?.trim()
  return value || undefined
}

function readFlag(name: string, fallback = false) {
  const value = readEnv(name)?.toLowerCase()
  if (!value) return fallback
  return value === '1' || value === 'true' || value === 'yes' || value === 'on'
}

export type MediaStorageMode = 'local' | 's3'

export function getMediaStorageMode(): MediaStorageMode {
  const requested = (readEnv('MEDIA_STORAGE') || 'local').toLowerCase()
  if (requested !== 's3') return 'local'

  const ready = Boolean(
    readEnv('S3_BUCKET') &&
      readEnv('S3_ACCESS_KEY_ID') &&
      readEnv('S3_SECRET_ACCESS_KEY') &&
      (readEnv('S3_REGION') || readEnv('S3_ENDPOINT')),
  )

  if (!ready) {
    console.warn(
      'MEDIA_STORAGE=s3 is set but S3_BUCKET / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY / S3_REGION (or S3_ENDPOINT) are incomplete. Using local filesystem uploads.',
    )
    return 'local'
  }

  return 's3'
}

/**
 * Payload storage plugins. Local disk is the default (dev and current VPS volume).
 * Production object storage is opt-in via MEDIA_STORAGE=s3 (S3, R2, MinIO, Spaces).
 * Files keep being served at /api/media/file/:filename so storefront URLs stay stable.
 */
export function mediaStoragePlugins(): Plugin[] {
  if (getMediaStorageMode() !== 's3') return []

  const endpoint = readEnv('S3_ENDPOINT')
  const region = readEnv('S3_REGION') || 'auto'
  const forcePathStyle = readFlag('S3_FORCE_PATH_STYLE', Boolean(endpoint))

  return [
    s3Storage({
      enabled: true,
      bucket: readEnv('S3_BUCKET') as string,
      collections: {
        media: {
          prefix: readEnv('S3_PREFIX') || 'media',
          generateFileURL: ({ filename }) => `/api/media/file/${filename}`,
        },
      },
      config: {
        credentials: {
          accessKeyId: readEnv('S3_ACCESS_KEY_ID') as string,
          secretAccessKey: readEnv('S3_SECRET_ACCESS_KEY') as string,
        },
        region,
        ...(endpoint ? { endpoint } : {}),
        ...(forcePathStyle ? { forcePathStyle: true } : {}),
      },
    }),
  ]
}
