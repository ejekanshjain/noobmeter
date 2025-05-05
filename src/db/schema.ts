import { createId } from '@paralleldrive/cuid2'
import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar
} from 'drizzle-orm/pg-core'
import { AdapterAccount } from 'next-auth/adapters'

export const genderEnum = pgEnum('gender', [
  'male',
  'female',
  'non_binary',
  'prefer_not_to_say'
])

export const gitConnectionTypeEnum = pgEnum('git_connection_type', [
  'github',
  'gitlab'
])

const commonFieldDefs = {
  id: (prefix: string) =>
    varchar('id')
      .primaryKey()
      .$defaultFn(() => prefix + '_' + createId()),
  dates: {
    createdAt: timestamp('created_at', {
      mode: 'date',
      withTimezone: true
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', {
      mode: 'date',
      withTimezone: true
    })
  },
  isActive: boolean('is_active').default(true)
}

export const usersTable = pgTable(
  'users',
  {
    id: commonFieldDefs.id('user'),
    email: varchar('email').notNull().unique(),
    firstName: varchar('first_name'),
    lastName: varchar('last_name'),
    name: varchar('display_name'),
    phone: varchar('phone', { length: 20 }),
    gender: genderEnum('gender'),
    dateOfBirth: date('date_of_birth', { mode: 'date' }),
    emailVerified: timestamp('email_verified', {
      mode: 'date',
      withTimezone: true
    }),
    image: text('image'),
    isAdmin: boolean('is_admin').default(false),
    isActive: commonFieldDefs.isActive,
    ...commonFieldDefs.dates
  },
  table => [index().on(table.email)]
)

export const userOAuthAccountsTable = pgTable(
  'user_oauth_accounts',
  {
    userId: varchar('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
    ...commonFieldDefs.dates
  },
  table => [
    primaryKey({
      columns: [table.provider, table.providerAccountId]
    }),
    index().on(table.userId),
    index().on(table.providerAccountId)
  ]
)

export const authVerificationTokensTable = pgTable(
  'auth_verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', {
      mode: 'date',
      withTimezone: true
    }).notNull()
  },
  table => [
    primaryKey({
      columns: [table.identifier, table.token]
    })
  ]
)

export const sessionsTable = pgTable(
  'sessions',
  {
    sessionToken: text('session_token').notNull().primaryKey(),
    userId: varchar('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    expires: timestamp('expires', {
      mode: 'date',
      withTimezone: true
    }).notNull(),
    ...commonFieldDefs.dates
  },
  table => [index().on(table.userId), index().on(table.sessionToken)]
)

export const gitConnectionsTable = pgTable('git_connections', {
  id: commonFieldDefs.id('git_connections'),
  type: gitConnectionTypeEnum('type').notNull(),
  host: text('host').notNull(),
  secret: text('secret').notNull(),
  project: text('project').notNull(),
  isActive: commonFieldDefs.isActive,
  ...commonFieldDefs.dates
})
