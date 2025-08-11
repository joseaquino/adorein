import { relations } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { randomUUID } from 'node:crypto'
import { userEmailVerifications, type UserEmailVerification } from './user_email_verifications.ts'
import { userThirdPartyAuths, type UserThirdPartyAuth } from './user_third_party_auths.ts'
import { type SchemaWith } from './types.ts'

export const users = sqliteTable(
  'users',
  {
    id: text('id')
      .primaryKey()
      .$default(() => randomUUID()),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password'),
    role: text('role', { enum: ['USER', 'ADMIN'] })
      .notNull()
      .default('USER'),
    emailVerifiedAt: integer('email_verified_at', { mode: 'timestamp' }),
    verificationSource: text('verification_source').default('email'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$default(() => new Date())
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .$default(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [index('idx_users_email_verified').on(table.emailVerifiedAt)]
)

export const usersRelations = relations(users, ({ many }) => ({
  thirdPartyAuths: many(userThirdPartyAuths),
  emailVerifications: many(userEmailVerifications),
}))

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

// Define available relations for this table - this provides autocompletion
type UserRelations = {
  thirdPartyAuths: UserThirdPartyAuth[]
  emailVerifications: UserEmailVerification[]
  // Add other relations here as they're defined
}

/**
 * Generic utility type for including relations with a user
 *
 * Usage examples:
 * - UserWith<'emailVerifications'> - includes email verifications
 * - UserWith<'thirdPartyAuths'> - includes third party auths
 * - UserWith<'emailVerifications' | 'thirdPartyAuths'> - includes multiple relations
 *
 * TypeScript will autocomplete available relation keys and ensure type safety
 */
export type UserWith<T extends keyof UserRelations> = SchemaWith<User, UserRelations, T>
