import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class LogoutUser {
  constructor(protected ctx: HttpContext) {}

  async handle() {
    const { auth } = this.ctx
    await auth.use('web').logout()
  }
}
