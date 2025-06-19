import { userThirdPartyAuths } from '#database/schema/user_third_party_auths'
import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { randomUUID } from 'node:crypto'

export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$default(() => randomUUID()),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$default(() => new Date())
    .$onUpdate(() => new Date()),
})

export const usersRelations = relations(users, ({ many }) => ({
  thirdPartyAuths: many(userThirdPartyAuths),
}))

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
