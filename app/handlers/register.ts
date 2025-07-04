import * as RegisterUserWithSocialProvider from '#actions/auth/register_user_with_social_provider'
import Actions from '#actions/index'
import { checkForExistingUser } from '#services/user_session_service'
import { newAccountValidator } from '#validators/account_validator'
import { SocialProviders } from '@adonisjs/ally/types'
import { HttpContext } from '@adonisjs/core/http'

/**
 * Handles the HTTP request for rendering the user registration form
 * @param ctx - The HTTP context for the registration form
 * @returns  A promise that resolves with the page object for the registration form
 */
export const renderRegistrationForm = async (ctx: HttpContext) => {
  const { inertia, ally } = ctx
  const providerNames = Object.keys(ally.config) as Array<keyof SocialProviders>

  const providers = providerNames.map((name) => ({
    name,
    url: ally.use(name).getRedirectUrl(),
  }))

  const { user, socialProvider } = await checkForExistingUser(ctx)

  return inertia.render('auth/register', {
    providers,
    existingAccount: { email: user?.email, providerName: socialProvider?.provider },
  })
}

/**
 * Handles the HTTP request for creating a new user
 * @param ctx - The HTTP context for the user creation action
 * @returns A promise that resolves when the user has been created
 */
export const registerNewUser = async (ctx: HttpContext) => {
  const { request, response, session, auth } = ctx
  const data = await request.validateUsing(newAccountValidator)

  try {
    // Create unverified user account
    const user = await Actions.auth.registerUser.handle({ data })
    await auth.use('web').login(user)

    return response.redirect().toRoute('auth.verify-email')
  } catch (error) {
    session.flash('error', error.message || 'An unexpected error occurred.')

    return response.redirect().back()
  }
}

/**
 * Handles the HTTP request for creating a new user with a social provider like Google or Facebook
 * @param ctx - The HTTP context for the user creation action
 * @returns A promise that resolves when the user has been created
 */
export const registerNewUserWithSocialProvider = async (ctx: HttpContext) => {
  const { params, inertia, session, response } = ctx

  try {
    const redirectUrl = await RegisterUserWithSocialProvider.handle({
      provider: params.provider,
    })
    return inertia.location(redirectUrl)
  } catch (error) {
    session.flash('error', 'Invalid OAuth provider')
    return response.redirect().toRoute('auth.register')
  }
}
