import { env } from '@/env.mjs'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as relations from './relations'
import * as schema from './schema'

export const db = drizzle(env.DATABASE_URL, {
  schema: { ...schema, ...relations }
})
