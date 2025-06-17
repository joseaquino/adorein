import { HttpContext } from '@adonisjs/core/http'

export async function handle() {
  const { auth } = HttpContext.getOrFail()
  await auth.use('web').logout()
}
