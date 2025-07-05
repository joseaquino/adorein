import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class EmailVerificationMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.user

    // User should be authenticated by this point (auth middleware runs first)
    if (!user) {
      return ctx.response.redirect().toRoute('auth.login')
    }

    // If user needs email verification, redirect to verification page
    if (user.verificationSource === 'email' && !user.emailVerifiedAt) {
      return ctx.response.redirect().toRoute('auth.verify-email')
    }

    return next()
  }
}
