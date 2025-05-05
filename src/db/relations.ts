import { relations } from 'drizzle-orm'
import { sessionsTable, userOAuthAccountsTable, usersTable } from './schema'

export const usersRelations = relations(usersTable, ({ many }) => ({
  accounts: many(userOAuthAccountsTable),
  sessions: many(sessionsTable)
}))

export const userOAuthAccountsRelations = relations(
  userOAuthAccountsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [userOAuthAccountsTable.userId],
      references: [usersTable.id]
    })
  })
)

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id]
  })
}))
