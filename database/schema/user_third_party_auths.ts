import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { randomUUID } from 'node:crypto'
import { users } from './users.ts'

export const userThirdPartyAuths = sqliteTable('user_third_party_auths', {
  id: text('id')
    .primaryKey()
    .$default(() => randomUUID()),
  provider: text('provider').notNull(),
  providerId: text('provider_id').notNull(),
  payload: text('payload').notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$default(() => new Date())
    .$onUpdate(() => new Date()),
})

export const userThirdPartyAuthsRelations = relations(userThirdPartyAuths, ({ one }) => ({
  user: one(users, {
    fields: [userThirdPartyAuths.userId],
    references: [users.id],
  }),
}))

export type UserThirdPartyAuth = typeof userThirdPartyAuths.$inferSelect
export type NewUserThirdPartyAuth = typeof userThirdPartyAuths.$inferInsert
