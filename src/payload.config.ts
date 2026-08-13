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
import { Tags } from './collections/Tags'
import { SizeGuides } from './collections/SizeGuides'
import { Orders } from './collections/Orders'
import { Couriers } from './collections/Couriers'
import { Pages } from './collections/Pages'
import { SiteSettings } from './globals/SiteSettings'
import { checkoutHandler, trackOrderHandler } from './endpoints/checkout'
import { mediaStoragePlugins } from './lib/storage'
import { siteOrigin } from './lib/site'
import { migrations } from './migrations'
import {
  assertProductionEnv,
  productionDatabaseUrl,
  productionPayloadSecret,
} from './lib/env'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Never throw while this module loads — Next.js imports it for storefront routes too.
try {
  assertProductionEnv()
} catch (error) {
  console.error('[ruminzuni] Production environment check failed:', error)
}

const databaseUrl = productionDatabaseUrl()
const serverURL = siteOrigin()
const payloadSecret = productionPayloadSecret()

export default buildConfig({
  serverURL,
  cors: [serverURL, 'https://ruminzuni.com'],
  csrf: [serverURL, 'https://ruminzuni.com'],
  telemetry: false,
  graphQL: {
    disablePlaygroundInProduction: true,
    disableIntrospectionInProduction: true,
    maxComplexity: 1000,
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' — RumiNZuni',
    },
    components: {
      beforeDashboard: ['/components/admin/DashboardStats'],
    },
  },
  collections: [Users, Media, Categories, Products, Tags, SizeGuides, Orders, Couriers, Pages],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUrl,
    },
    push: process.env.NODE_ENV !== 'production',
    prodMigrations: migrations,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: [...mediaStoragePlugins()],
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
