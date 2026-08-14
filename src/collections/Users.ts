import { APIError, type CollectionBeforeValidateHook, type CollectionConfig } from 'payload'
import { isOwner } from '@/access/isAdmin'
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
    description:
      'Owner (Admin) can add Staff accounts here. Staff log in at /admin to manage products, orders, and store settings. Use a unique 12+ character password. Do not share the owner login.',
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
    create: isOwner,
    read: ({ req: { user } }) => {
      if (!user) return false
      if ((user as { role?: string }).role === 'admin') return true
      return { id: { equals: user.id } }
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if ((user as { role?: string }).role === 'admin') return true
      return { id: { equals: user.id } }
    },
    delete: isOwner,
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
        { label: 'Admin (owner — can add staff)', value: 'admin' },
        { label: 'Staff (shop day-to-day)', value: 'staff' },
      ],
      access: {
        update: ({ req: { user } }) => (user as { role?: string } | null)?.role === 'admin',
      },
      admin: {
        description: 'Staff can run the shop. Only Admin can create users or change roles.',
      },
    },
  ],
}
