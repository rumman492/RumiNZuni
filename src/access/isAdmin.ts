import type { Access, FieldAccess } from 'payload'

type RoleUser = { role?: string | null } | null | undefined

export const isAdmin: Access = ({ req: { user } }) => Boolean(user)

export const isAdminField: FieldAccess = ({ req: { user } }) => Boolean(user)

export const isOwner: Access = ({ req: { user } }) => (user as RoleUser)?.role === 'admin'

export const isOwnerField: FieldAccess = ({ req: { user } }) => (user as RoleUser)?.role === 'admin'

export const anyone: Access = () => true
