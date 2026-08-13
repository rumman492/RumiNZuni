import config from '@payload-config'
import { GRAPHQL_PLAYGROUND_GET } from '@payloadcms/next/routes'

export const GET =
  process.env.NODE_ENV === 'production'
    ? () => new Response(null, { status: 404 })
    : GRAPHQL_PLAYGROUND_GET(config)
