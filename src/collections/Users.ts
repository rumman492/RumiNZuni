import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

const isProduction = process.env.NODE_ENV === 'production'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Staff',
  },
  auth: {
    tokenExpiration: 60 * 60 * 8,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    useAPIKey: false,
    cookies: {
      sameSite: 'Lax',
      secure: isProduction,
    },
  },
  access: {
    admin: ({ req: { user } }) => Boolean(user),
    create: () => false,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Staff', value: 'staff' },
      ],
    },
  ],
}
