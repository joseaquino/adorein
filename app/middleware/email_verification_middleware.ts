import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class EmailVerificationMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // Only allow access if user is logged in but not verified
    if (!ctx.auth.user) {
      return ctx.response.redirect().toRoute('auth.login')
    }

    // If already verified, redirect to home
    if (ctx.auth.user.emailVerifiedAt) {
      return ctx.response.redirect().toRoute('home')
    }

    return next()
  }
}
