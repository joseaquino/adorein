import { relations } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { randomUUID } from 'node:crypto'
import { users, type User } from './users.ts'
import { type SchemaWith } from './types.ts'

export const userEmailVerifications = sqliteTable(
  'user_email_verifications',
  {
    id: text('id')
      .primaryKey()
      .$default(() => randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    otpCode: text('otp_code').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    attempts: integer('attempts').default(0).notNull(),
    maxAttempts: integer('max_attempts').default(3).notNull(),
    lastSentAt: integer('last_sent_at', { mode: 'timestamp' }).notNull(),
    resendCount: integer('resend_count').default(0).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$default(() => new Date())
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .$default(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('idx_email_verifications_user_id').on(table.userId),
    index('idx_email_verifications_otp').on(table.otpCode),
    index('idx_email_verifications_expires').on(table.expiresAt),
  ]
)

export const userEmailVerificationsRelations = relations(userEmailVerifications, ({ one }) => ({
  user: one(users, {
    fields: [userEmailVerifications.userId],
    references: [users.id],
  }),
}))

export type UserEmailVerification = typeof userEmailVerifications.$inferSelect
export type NewUserEmailVerification = typeof userEmailVerifications.$inferInsert

// Define available relations for this table - this provides autocompletion
type UserEmailVerificationRelations = {
  user: User
  // Add other relations here as they're defined
}

/**
 * Generic utility type for including relations with a table
 *
 * Usage examples:
 * - EmailVerificationWith<'user'> - includes user relation
 * - EmailVerificationWith<'user' | 'otherRelation'> - includes multiple relations (when available)
 *
 * TypeScript will autocomplete available relation keys and ensure type safety
 */
export type EmailVerificationWith<T extends keyof UserEmailVerificationRelations> = SchemaWith<
  UserEmailVerification,
  UserEmailVerificationRelations,
  T
>
