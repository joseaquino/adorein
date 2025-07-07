import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { randomUUID } from 'node:crypto'
import { users, type User } from './users.ts'
import { type SchemaWith } from './types.ts'

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

// Define available relations for this table - this provides autocompletion
type UserThirdPartyAuthRelations = {
  user: User
  // Add other relations here as they're defined
}

/**
 * Generic utility type for including relations with a third party auth
 *
 * Usage examples:
 * - ThirdPartyAuthWith<'user'> - includes user relation
 * - ThirdPartyAuthWith<'user' | 'otherRelation'> - includes multiple relations (when available)
 *
 * TypeScript will autocomplete available relation keys and ensure type safety
 */
export type ThirdPartyAuthWith<T extends keyof UserThirdPartyAuthRelations> = SchemaWith<
  UserThirdPartyAuth,
  UserThirdPartyAuthRelations,
  T
>
