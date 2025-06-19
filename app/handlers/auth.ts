import Actions from '#actions/index'
import { SocialProviders } from '@adonisjs/ally/types'
import { HttpContext } from '@adonisjs/core/http'

/**
 * Handles the HTTP request for rendering the login form
 * @param ctx - The HTTP request context
 * @returns An Inertia response to render the login form
 */
export const renderLogin = async ({ inertia, session }: HttpContext) => {
  session.forget('account-identifier')
  return inertia.render('auth/login')
}

/**
 * Handles the HTTP request for identifying an account by email
 * @param ctx - The HTTP request context
 * @returns An HTTP response that redirects to challenge or login page
 */
export const handleAccountIdentification = async (ctx: HttpContext) => {
  const email = ctx.request.input('email')

  const result = await Actions.auth.identifyAccount.handle({ email })

  if (result.success) {
    ctx.session.put('account-identifier', result.user.email)
    return ctx.response.redirect().toRoute('auth.challenge')
  }

  ctx.session.flash('errorsBag', result.errors)

  return ctx.response.redirect().toRoute('auth.login')
}

/**
 * Renders the authentication challenge page with available auth providers
 * @param ctx - The HTTP request context
 * @returns An Inertia response to render the authentication challenge page
 */
export const renderAuthChallenge = async (ctx: HttpContext) => {
  const email = ctx.session.get('account-identifier')

  if (!email) {
    ctx.response.redirect().toRoute('auth.login')
  }

  const result = await Actions.users.getUserWithAuthProviders.handle({ email })

  if (result.success) {
    const providerPromises = result.user.thirdPartyAuths.map(async (oauthProvider) => ({
      name: oauthProvider.provider,
      url: await ctx.ally.use(oauthProvider.provider as keyof SocialProviders).getRedirectUrl(),
    }))

    const authProviders = await Promise.all(providerPromises)

    if (result.user.password) {
      authProviders.push({ name: 'password', url: '' })
    }
    return ctx.inertia.render('auth/challenge', {
      email,
      authProviders,
    })
  }

  ctx.session.flash('errorsBag', result.errors)

  return ctx.response.redirect().toRoute('auth.login')
}

/**
 * Handles the HTTP request for logging in a user
 * @param ctx - The HTTP request context
 * @returns And HTTP response that logs in the user on successful authentication
 */
export const handleUserLogin = async (ctx: HttpContext) => {
  const inputs = ctx.request.only(['email', 'password'])
  const result = await Actions.auth.loginUser.handle({
    email: inputs.email,
    password: inputs.password,
  })

  if (result.success) {
    await ctx.auth.use('web').login(result.user)

    return ctx.response.redirect().toRoute('home')
  }

  if (result.errors.email) {
    return ctx.response.redirect().toRoute('login')
  }

  ctx.session.flash('errorsBag', result.errors)

  return ctx.response.redirect().toRoute('auth.challenge')
}

/**
 * Handles the HTTP request for logging out a user
 * @param ctx - The HTTP request context
 * @returns An HTTP response that redirects the user to the login page
 */
export const handleUserLogout = async (ctx: HttpContext) => {
  await Actions.auth.logoutUser.handle()

  return ctx.response.redirect().toRoute('auth.login')
}

/**
 * Handles the HTTP request from the OAuth provider callback, this should be called
 * after the OAuth provider has successfully authenticated the user
 * @param ctx The HTTP request context
 * @returns An HTTP response to login the user when a successful OAuth callback is received
 */
export const handleOAuthCallback = async (ctx: HttpContext) => {
  try {
    const result = await Actions.auth.handleOauthCallback.handle()

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
  const result = await Actions.auth.getOauthUserForUpdate.handle()

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
  const result = await Actions.auth.updateNewOauthUser.handle()

  if (result.success) {
    return ctx.response.redirect().toRoute('home')
  }

  return ctx.response.redirect().toRoute(result.redirectTo)
}
