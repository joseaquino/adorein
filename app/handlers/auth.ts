import GetOauthUserForUpdate from '#actions/auth/get_oauth_user_for_update'
import HandleOauthCallback from '#actions/auth/handle_oauth_callback'
import LoginUser from '#actions/auth/login_user'
import LogoutUser from '#actions/auth/logout_user'
import UpdateNewOauthUser from '#actions/auth/update_new_oauth_user'
import { HttpContext } from '@adonisjs/core/http'

/**
 * Handles the HTTP request for rendering the login form
 * @param ctx - The HTTP request context
 * @returns An Inertia response to render the login form
 */
export const renderLogin = async ({ inertia }: HttpContext) => {
  return inertia.render('auth/login')
}

/**
 * Handles the HTTP request for logging in a user
 * @param ctx - The HTTP request context
 * @returns And HTTP response that logs in the user on successful authentication
 */
export const handleUserLogin = async (ctx: HttpContext) => {
  const result = await LoginUser.handle()

  if (result.success) {
    return ctx.response.redirect().toRoute('home')
  }

  ctx.session.flash('errorsBag', result.errors)

  if (result.authProviders) {
    return ctx.inertia.render('auth/login', {
      userEmail: result.userEmail,
      authProviders: result.authProviders,
    })
  }

  return ctx.response.redirect().toRoute('login')
}

/**
 * Handles the HTTP request for logging out a user
 * @param ctx - The HTTP request context
 * @returns An HTTP response that redirects the user to the login page
 */
export const handleUserLogout = async (ctx: HttpContext) => {
  await LogoutUser.handle()

  return ctx.response.redirect().toRoute('login')
}

/**
 * Handles the HTTP request from the OAuth provider callback, this should be called
 * after the OAuth provider has successfully authenticated the user
 * @param ctx The HTTP request context
 * @returns An HTTP response to login the user when a successful OAuth callback is received
 */
export const handleOAuthCallback = async (ctx: HttpContext) => {
  try {
    const result = await HandleOauthCallback.handle()

    if (result.success === false && result.flash) {
      ctx.session.flash(result.flash.type, result.flash.message)
    }

    if (result.success === true && result.redirectTo === 'new-oauth-user') {
      return ctx.response.redirect().toRoute(result.redirectTo, { providerId: result.providerId })
    }

    return ctx.response.redirect().toRoute(result.redirectTo)
  } catch (error) {
    ctx.session.flash('error', 'An unexpected error occurred during OAuth callback.')
    return ctx.response.redirect().toRoute('auth.register')
  }
}

/**
 * Renders the new OAuth user update form
 * @param ctx - The HTTP request context
 * @returns An Inertia response to render the new OAuth user update form
 */
export const renderNewOAuthUser = async (ctx: HttpContext) => {
  const result = await GetOauthUserForUpdate.handle()

  if (!result.success) {
    return ctx.response.redirect().toRoute('auth.register')
  }

  return ctx.inertia.render('auth/new', result.data)
}

/**
 * Handles the HTTP request for updating the user account after registering with an OAuth provider
 * @param ctx - The HTTP request context
 * @returns An HTTP response that logs in the user after updating their OAuth account
 */
export const handleNewOAuthUserUpdate = async (ctx: HttpContext) => {
  const result = await UpdateNewOauthUser.handle()

  if (result.success) {
    return ctx.response.redirect().toRoute('home')
  }

  return ctx.response.redirect().toRoute(result.redirectTo)
}
