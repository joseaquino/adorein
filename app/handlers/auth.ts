import User from '#models/user'
import UserThirdPartyAuth from '#models/user_third_party_auth'
import { newOAuthAccountValidator } from '#validators/account_validator'
import { SocialProviders } from '@adonisjs/ally/types'
import { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'

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
  const { ally, inertia, session, request, response, auth } = ctx

  const email = request.input('email')

  if (!email) {
    session.flash('errors', { email: 'Please provide your email address.' })
    return response.redirect().toRoute('login')
  }

  const user = await User.query().where('email', email).preload('thirdPartyAuths').first()

  if (!user) {
    session.flash('errors', { email: 'We were unable to find your account.' })
    return response.redirect().toRoute('login')
  }

  const password = request.input('password')

  if (password === undefined) {
    const authProviders = user.thirdPartyAuths.map((oauthProvider) => ({
      name: oauthProvider.provider,
      url: ally.use(oauthProvider.provider as keyof SocialProviders).getRedirectUrl(),
    }))

    if (user.password) {
      authProviders.push({ name: 'password', url: '' })
    }
    return inertia.render('auth/login', { userEmail: user.email, authProviders })
  }

  if (!user.password) {
    session.flash('errors', { password: 'Your account is missing a password.' })
    return response.redirect().toRoute('login')
  }

  if (password === null) {
    return inertia.render('auth/login', {
      userEmail: user.email,
      errors: { password: 'Please provide your password.' },
    })
  }

  const isPasswordValid = await hash.verify(user.password, password)

  if (!isPasswordValid) {
    return inertia.render('auth/login', {
      userEmail: user.email,
      errors: { password: 'The password you provided is incorrect.' },
    })
  }

  await auth.use('web').login(user)

  return response.redirect().toRoute('home')
}

/**
 * Handles the HTTP request for logging out a user
 * @param ctx - The HTTP request context
 * @returns An HTTP response that redirects the user to the login page
 */
export const handleUserLogout = async ({ auth, response }: HttpContext) => {
  await auth.use('web').logout()

  return response.redirect().toRoute('login')
}

/**
 * Handles the HTTP request from the OAuth provider callback, this should be called
 * after the OAuth provider has successfully authenticated the user
 * @param ctx The HTTP request context
 * @returns An HTTP response to login the user when a successful OAuth callback is received
 */
export const handleOAuthCallback = async (ctx: HttpContext) => {
  const { ally, params, response, auth, session } = ctx

  const providers = Object.keys(ally.config) as Array<keyof SocialProviders>
  const targetProvider = providers.find((provider) => provider === params.provider)

  if (!targetProvider) {
    session.flash('error', `Invalid OAuth provider: ${params.provider}`)
    return response.redirect().toRoute('register')
  }

  const providerInstance = ally.use(targetProvider)

  const providerUser = await providerInstance.user()

  let userOAuth = await UserThirdPartyAuth.query()
    .where('provider', params.provider)
    .where('provider_id', providerUser.id)
    .preload('user')
    .first()

  if (!userOAuth) {
    userOAuth = await UserThirdPartyAuth.create({
      provider: params.provider,
      providerId: providerUser.id,
      payload: JSON.stringify(providerUser),
    })
  } else {
    userOAuth.merge({ payload: JSON.stringify(providerUser) })
    await userOAuth.save()
  }

  if (!userOAuth.user) {
    const newAccountData = session.pull('isNewAccount', false)
    const existingUser = await User.findBy('email', providerUser.email)

    // If the user is registering with an OAuth provider that has not been used before but the email is already in use
    // we redirect the user to the registration form to see if they would like to link the accounts
    if (newAccountData && existingUser) {
      session.put('existingAccount', {
        providerId: userOAuth.id,
        userId: existingUser.id,
      })
      return response.redirect().toRoute('auth.register')
    }

    const [firstName, lastName] = providerUser.name.split(' ')
    const newUser = await User.create({
      email: providerUser.email,
      firstName,
      lastName,
    })
    await userOAuth.related('user').associate(newUser)
    return response.redirect().toRoute('new-oauth-user', { providerId: userOAuth.id })
  }

  await auth.use('web').login(userOAuth.user)

  return response.redirect().toRoute('home')
}

/**
 * Renders the new OAuth user update form
 * @param ctx - The HTTP request context
 * @returns An Inertia response to render the new OAuth user update form
 */
export const renderNewOAuthUser = async (ctx: HttpContext) => {
  const { inertia, params, response } = ctx

  const userOAuth = await UserThirdPartyAuth.query()
    .where('id', params.providerId)
    .preload('user')
    .first()

  if (!userOAuth || !userOAuth.user) {
    return response.redirect().toRoute('register')
  }

  return inertia.render('auth/new', {
    providerId: userOAuth.id,
    provider: userOAuth.provider,
    email: userOAuth.user.email,
    firstName: userOAuth.user.firstName,
    lastName: userOAuth.user.lastName,
  })
}

/**
 * Handles the HTTP request for updating the user account after registering with an OAuth provider
 * @param ctx - The HTTP request context
 * @returns An HTTP response that logs in the user after updating their OAuth account
 */
export const handleNewOAuthUserUpdate = async (ctx: HttpContext) => {
  const { params, request, response, auth } = ctx

  const userOAuth = await UserThirdPartyAuth.query()
    .where('id', params.providerId)
    .preload('user')
    .first()

  if (!userOAuth || !userOAuth.user) {
    return response.redirect().toRoute('register')
  }

  const userData = await request.validateUsing(newOAuthAccountValidator, {
    meta: { userId: userOAuth.user.id },
  })
  await userOAuth.user.merge(userData).save()

  await auth.use('web').login(userOAuth.user)

  return response.redirect().toRoute('home')
}
