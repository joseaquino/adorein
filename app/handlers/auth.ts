import { db } from '#database/db'
import { userThirdPartyAuths } from '#database/schema/user_third_party_auths'
import { users } from '#database/schema/users'
import { newOAuthAccountValidator } from '#validators/account_validator'
import { SocialProviders } from '@adonisjs/ally/types'
import { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import { eq } from 'drizzle-orm'

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

  const user = await db.query.users.findFirst({
    where: (u, operators) => operators.eq(u.email, email),
    with: {
      thirdPartyAuths: true,
    },
  })

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
  const { ally, params, response, auth, session, inertia } = ctx

  const providers = Object.keys(ally.config) as Array<keyof SocialProviders>
  const targetProvider = providers.find((provider) => provider === params.provider)

  if (!targetProvider) {
    session.flash('error', `Invalid OAuth provider: ${params.provider}`)
    return response.redirect().toRoute('register')
  }

  const providerInstance = ally.use(targetProvider)

  const providerUser = await providerInstance.user()

  let userOAuth = await db.query.userThirdPartyAuths.findFirst({
    where: (tpa, { eq, and }) =>
      and(
        eq(tpa.provider, params.provider),
        eq(tpa.providerId, providerUser.id)
      ),
    with: {
      user: true,
    },
  })

  if (!userOAuth) {
    const [createdUserOAuth] = await db
      .insert(userThirdPartyAuths)
      .values({
        provider: params.provider,
        providerId: providerUser.id,
        payload: JSON.stringify(providerUser),
      })
      .returning()
    
    userOAuth = await db.query.userThirdPartyAuths.findFirst({
      where: (tpa, { eq }) => eq(tpa.id, createdUserOAuth.id),
      with: {
        user: true,
      },
    })
    
    if (!userOAuth) {
      return response.redirect().toRoute('register')
    }
  } else {
    await db
      .update(userThirdPartyAuths)
      .set({ payload: JSON.stringify(providerUser) })
      .where(eq(userThirdPartyAuths.id, userOAuth.id))
  }

  if (!userOAuth.user) {
    const newAccountData = session.pull('isNewAccount', false)
    const existingUser = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, providerUser.email),
    })

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
    const [newUser] = await db
      .insert(users)
      .values({
        email: providerUser.email,
        firstName,
        lastName,
      })
      .returning()
    await db
      .update(userThirdPartyAuths)
      .set({ userId: newUser.id })
      .where(eq(userThirdPartyAuths.id, userOAuth.id))
    return response.redirect().toRoute('new-oauth-user', { providerId: userOAuth.id })
  }

  if (!userOAuth.user) {
    return response.redirect().toRoute('register')
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

  const userOAuth = await db.query.userThirdPartyAuths.findFirst({
    where: (tpa, { eq }) => eq(tpa.id, params.providerId),
    with: {
      user: true,
    },
  })

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

  const userOAuth = await db.query.userThirdPartyAuths.findFirst({
    where: (tpa, { eq }) => eq(tpa.id, params.providerId),
    with: {
      user: true,
    },
  })

  if (!userOAuth || !userOAuth.user) {
    return response.redirect().toRoute('register')
  }

  const userData = await request.validateUsing(newOAuthAccountValidator, {
    meta: { userId: userOAuth.user.id },
  })
  await db.update(users).set(userData).where(eq(users.id, userOAuth.user.id))

  await auth.use('web').login(userOAuth.user)

  return response.redirect().toRoute('home')
}
