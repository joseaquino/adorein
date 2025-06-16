import { db } from '#database/db'
import { users } from '#database/schema/users'
import { newAccountValidator } from '#validators/account_validator'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import type { Infer } from '@vinejs/vine/types'

type Params = {
  data: Infer<typeof newAccountValidator>
}

@inject()
export default class RegisterUser {
  constructor(protected ctx: HttpContext) {}

  async handle({ data }: Params) {
    const { auth, session } = this.ctx
    try {
      const [user] = await db.insert(users).values(data).returning()

      session.flash('success', 'Your account has been created successfully.')

      await auth.use('web').login(user)

      return user
    } catch (error) {
      // Log the error
      throw new Error('Could not create account.')
    }
  }
}
