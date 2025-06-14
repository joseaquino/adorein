import { db } from '#database/db'
import { users } from '#database/schema/users'
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
export const registerNewUser = async ({ request, response, auth, session }: HttpContext) => {
  const payload = await request.validateUsing(newAccountValidator)

  const [user] = await db.insert(users).values(payload).returning()

  session.flash('success', 'Your account has been created. Please login.')

  await auth.use('web').login(user)

  return response.redirect().toRoute('home')
}

/**
 * Handles the HTTP request for creating a new user with a social provider like Google or Facebook
 * @param ctx - The HTTP context for the user creation action
 * @returns A promise that resolves when the user has been created
 */
export const registerNewUserWithSocialProvider = async (ctx: HttpContext) => {
  const { ally, session, response, params, inertia } = ctx

  const enabledProviders = Object.keys(ally.config) as Array<keyof SocialProviders>
  const targetProvider = enabledProviders.find((provider) => provider === params.provider)

  if (!targetProvider) {
    session.flash('error', 'Invalid OAuth provider')
    return response.redirect().toRoute('auth.register')
  }

  const providerInstance = ally.use(targetProvider)

  session.put('isNewAccount', true)

  const redirectUrl = await providerInstance.getRedirectUrl()

  return inertia.location(redirectUrl)
}
