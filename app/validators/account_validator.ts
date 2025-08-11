import { db } from '#database/db'
import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'

// Custom unique validator for email
const uniqueEmailRule = vine.createRule(
  async (value: unknown, _options: any, field: FieldContext) => {
    if (!value || typeof value !== 'string') {
      return
    }

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, value),
    })

    if (user) {
      field.report('The {{ field }} has already been taken', 'unique', field)
    }
  }
)

// Custom unique validator for email excluding current user
const uniqueEmailExceptRule = vine.createRule(
  async (value: unknown, _options: any, field: FieldContext) => {
    if (!value || typeof value !== 'string') {
      return
    }

    const userId = field.meta?.userId
    if (!userId) {
      return
    }

    const user = await db.query.users.findFirst({
      where: (users, { eq, and, ne }) => and(ne(users.id, userId), eq(users.email, value)),
    })

    if (user) {
      field.report('The {{ field }} has already been taken', 'unique', field)
    }
  }
)

export const newAccountValidator = vine.compile(
  vine.object({
    firstName: vine.string().trim().maxLength(255),
    lastName: vine.string().trim().maxLength(255),
    email: vine.string().trim().email().use(uniqueEmailRule()),
    password: vine.string().trim().minLength(8).maxLength(32),
  })
)

export const newOAuthAccountValidator = vine.compile(
  vine.object({
    firstName: vine.string().trim().maxLength(255),
    lastName: vine.string().trim().maxLength(255),
    email: vine.string().trim().email().use(uniqueEmailExceptRule()),
  })
)

export const emailValidator = vine.object({
  email: vine.string().trim().email(),
})

export const updateProfileValidator = vine.compile(
  vine.object({
    firstName: vine.string().trim().maxLength(255),
    lastName: vine.string().trim().maxLength(255),
    email: vine.string().trim().email().use(uniqueEmailExceptRule()),
  })
)
