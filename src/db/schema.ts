import { createId } from '@paralleldrive/cuid2'
import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
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

export const queueStatusEnum = pgEnum('queue_status', [
  'pending',
  'processing',
  'processed',
  'error'
])

export const commitCategoryEnum = pgEnum('commit_category', [
  'trivial',
  'minor',
  'standard',
  'significant',
  'major',
  'exceptional'
])

export const technicalDomainEnum = pgEnum('technical_domain', [
  'algorithms',
  'security',
  'performance',
  'database',
  'backend',
  'devops',
  'frontend',
  'refactoring',
  'testing',
  'documentation'
])

export const commitImpactEnum = pgEnum('commit_impact', [
  'security',
  'performance',
  'bugfix',
  'feature',
  'refactoring',
  'testing',
  'ui_ux',
  'documentation',
  'chore'
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
    name: varchar('display_name'),
    phone: varchar('phone', { length: 20 }),
    emailVerified: timestamp('email_verified', {
      mode: 'date',
      withTimezone: true
    }),
    image: text('image'),
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

export const gitConnectionsTable = pgTable(
  'git_connections',
  {
    id: commonFieldDefs.id('git_connection'),
    userId: varchar('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    type: gitConnectionTypeEnum('type').notNull(),
    host: text('host').notNull(),
    project: text('project').notNull(),
    isActive: commonFieldDefs.isActive,
    webhookSecret: text('webhook_secret').notNull(),
    token: text('token').notNull(),
    customPrompt: text('custom_prompt'),
    ...commonFieldDefs.dates
  },
  table => [index().on(table.type, table.host, table.project, table.isActive)]
)

export const gitCommitsTable = pgTable(
  'git_commits',
  {
    id: commonFieldDefs.id('git_commit'),
    sha: text('sha').notNull(),
    url: text('url').notNull(),
    message: text('message').notNull(),
    date: timestamp('date', {
      mode: 'date',
      withTimezone: true
    }).notNull(),
    authorEmail: text('author_email').notNull(),
    gitConnectionId: varchar('git_connection_id')
      .notNull()
      .references(() => gitConnectionsTable.id, { onDelete: 'cascade' }),

    // Queue
    queueStatus: queueStatusEnum('queue_status').default('pending'),
    errorMessage: text('error_message'),

    // AI Review
    correctness: integer('correctness'),
    bestPractices: integer('best_practices'),
    readability: integer('readability'),
    performance: integer('performance'),
    security: integer('security'),

    technicalQuality: integer('technical_quality'),
    category: commitCategoryEnum('category'),
    domain: technicalDomainEnum('domain'),
    impact: commitImpactEnum('impact'),
    classificationReasoning: text('classification_reasoning'),
    categoryMultiplier: jsonb('category_multiplier'),
    domainMultiplier: jsonb('domain_multiplier'),
    impactMultiplier: jsonb('impact_multiplier'),
    contributionPoints: integer('contribution_points'),
    summary: text('summary'),
    finalScore: integer('final_score'),

    ...commonFieldDefs.dates
  },
  table => [
    uniqueIndex().on(table.sha, table.gitConnectionId),
    index().on(table.gitConnectionId),
    index().on(table.queueStatus),
    index().on(table.date),
    index().on(table.authorEmail),
    index().on(table.gitConnectionId, table.queueStatus, table.date),
    index()
      .on(
        table.gitConnectionId,
        table.queueStatus,
        table.date,
        table.authorEmail
      )
      .where(sql`${table.queueStatus} = 'pending'`)
  ]
)
