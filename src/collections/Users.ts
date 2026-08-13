import { APIError, type CollectionBeforeValidateHook, type CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { assertStrongPassword } from '@/lib/env'

const isProduction = process.env.NODE_ENV === 'production'

const requireStrongPassword: CollectionBeforeValidateHook = ({ data }) => {
  if (data && typeof data.password === 'string' && data.password.length > 0) {
    try {
      assertStrongPassword(data.password)
    } catch (error) {
      throw new APIError(error instanceof Error ? error.message : 'Choose a stronger password.', 400)
    }
  }
  return data
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Staff',
    description: 'Create the first admin on this screen. Use a unique 12+ character password.',
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
  hooks: {
    beforeValidate: [requireStrongPassword],
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
