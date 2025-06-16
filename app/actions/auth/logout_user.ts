import { HttpContext } from '@adonisjs/core/http'

export default class LogoutUser {
  static async handle() {
    const { auth } = HttpContext.getOrFail()
    await auth.use('web').logout()
  }
}
