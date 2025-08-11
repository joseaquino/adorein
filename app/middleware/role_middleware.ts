import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Role middleware is used to check if the authenticated user
 * has the specified role. Redirects to home page if user doesn't have the required role.
 */
export default class RoleMiddleware {
  /**
   * The URL to redirect to when user doesn't have the required role
   */
  redirectTo = '/'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      role: string
    }
  ) {
    // Ensure user is authenticated (should be handled by auth middleware first)
    const user = ctx.auth.user

    if (!user) {
      return ctx.response.redirect(this.redirectTo)
    }

    // Check if user has the required role
    if (user.role !== options.role) {
      return ctx.response.redirect(this.redirectTo)
    }

    return next()
  }
}
