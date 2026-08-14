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
import { AgeGroups } from './collections/AgeGroups'
import { Sizes } from './collections/Sizes'
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
import { seedCatalogIfEmpty } from './lib/seedCatalog'
import { seedSizingAndAccessories } from './lib/seedSizing'

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
      titleSuffix: ' — Rumi & Zuni',
    },
    components: {
      beforeDashboard: ['/components/admin/DashboardStats'],
    },
  },
  collections: [Users, Media, Categories, Products, Tags, AgeGroups, Sizes, SizeGuides, Orders, Couriers, Pages],
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
  onInit: async (payload) => {
    try {
      await seedSizingAndAccessories(payload)
    } catch (error) {
      payload.logger.error(
        error instanceof Error ? error.message : 'Could not load size chart / age groups. Add them in Admin → Sizes.',
      )
    }
    if (process.env.SEED_CATALOG !== 'true') return
    try {
      await seedCatalogIfEmpty(payload)
    } catch (error) {
      payload.logger.error(
        error instanceof Error ? error.message : 'Sample catalog seed failed. The shop will stay empty until you add products in /admin.',
      )
    }
  },
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
