import vine from '@vinejs/vine'

export const newAccountValidator = vine.compile(
  vine.object({
    firstName: vine.string().trim().maxLength(255),
    lastName: vine.string().trim().maxLength(255),
    email: vine
      .string()
      .trim()
      .email()
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()

        return !user
      }),
    password: vine.string().trim().minLength(8).maxLength(32),
  })
)

export const newOAuthAccountValidator = vine.compile(
  vine.object({
    firstName: vine.string().trim().maxLength(255),
    lastName: vine.string().trim().maxLength(255),
    email: vine
      .string()
      .trim()
      .email()
      .unique(async (db, value, field) => {
        const user = await db
          .from('users')
          .whereNot('id', field.meta.userId)
          .where('email', value)
          .first()

        return !user
      }),
  })
)
