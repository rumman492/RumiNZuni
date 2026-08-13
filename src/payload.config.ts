import path from 'path'
import { fileURLToPath } from 'url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Products } from './collections/Products'
import { Orders } from './collections/Orders'
import { Couriers } from './collections/Couriers'
import { Pages } from './collections/Pages'
import { SiteSettings } from './globals/SiteSettings'
import { checkoutHandler, trackOrderHandler } from './endpoints/checkout'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const databaseUrl = process.env.DATABASE_URL || 'postgresql://ruminzuni:ruminzuni@127.0.0.1:5432/ruminzuni'
const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export default buildConfig({
  serverURL,
  cors: [serverURL],
  csrf: [serverURL],
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' — RumiNZuni',
    },
  },
  collections: [Users, Media, Categories, Products, Orders, Couriers, Pages],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUrl,
    },
    push: process.env.PAYLOAD_DB_PUSH !== 'false',
  }),
  sharp,
  endpoints: [
    {
      path: '/checkout',
      method: 'post',
      handler: checkoutHandler,
    },
    {
      path: '/track-order',
      method: 'get',
      handler: trackOrderHandler,
    },
  ],
})
