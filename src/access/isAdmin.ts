import type { Access, FieldAccess } from 'payload'

export const isAdmin: Access = ({ req: { user } }) => Boolean(user)

export const isAdminField: FieldAccess = ({ req: { user } }) => Boolean(user)

export const anyone: Access = () => true
