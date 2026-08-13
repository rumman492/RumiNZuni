import 'dotenv/config'
import { getPayload } from 'payload'
import config from './payload.config'
import { assertStrongPassword } from './lib/env'
import { seedCatalog } from './lib/seedCatalog'

async function seed() {
  const catalogOnly = process.env.SEED_CATALOG === 'true'
  if (process.env.NODE_ENV === 'production' && !catalogOnly) {
    throw new Error(
      'npm run seed is blocked in production. Create the admin user at /admin, or seed the catalog with SEED_CATALOG=true.',
    )
  }

  const payload = await getPayload({ config })
  const skipAdmin = process.env.NODE_ENV === 'production' || catalogOnly

  if (!skipAdmin) {
    const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim()
    const adminPassword = process.env.SEED_ADMIN_PASSWORD
    const adminName = process.env.SEED_ADMIN_NAME?.trim() || 'Store admin'

    if (adminEmail && adminPassword) {
      assertStrongPassword(adminPassword)
      const existingAdmin = await payload.find({
        collection: 'users',
        where: { email: { equals: adminEmail } },
        limit: 1,
      })

      if (existingAdmin.totalDocs === 0) {
        await payload.create({
          collection: 'users',
          data: {
            email: adminEmail,
            password: adminPassword,
            name: adminName,
            role: 'admin',
          },
        })
        payload.logger.info(`Created admin user ${adminEmail}`)
      }
    } else {
      payload.logger.info(
        'Skipping admin seed. Create a user at /admin or set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD.',
      )
    }
  } else {
    payload.logger.info('Catalog seed only — admin users are not created.')
  }

  await seedCatalog(payload)
  payload.logger.info('Create or use an admin user at /admin — credentials are never logged.')
  process.exit(0)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
