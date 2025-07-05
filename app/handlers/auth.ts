import Actions from '#actions/index'
import { emailVerificationValidator } from '#validators/auth_validator'
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
  // Check if user is authenticated before attempting logout
  if (ctx.auth.user) {
    await Actions.auth.logoutUser.handle()
  }

  // Clear any session data that might interfere
  ctx.session.clear()

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

/**
 * Renders the email verification page
 * @param ctx - The HTTP request context
 * @returns An Inertia response to render the email verification page
 */
export const renderEmailVerification = async (ctx: HttpContext) => {
  const user = ctx.auth.user!

  // Redirect to home if user is already verified
  if (user.emailVerifiedAt) {
    return ctx.response.redirect().toRoute('home')
  }

  // Find existing verification or create new one
  const result = await Actions.auth.findOrCreateEmailVerification.handle({ userId: user.id })

  if (!result.success) {
    return ctx.inertia.render('auth/verify-email', {
      email: user.email,
      attemptsRemaining: 0,
      waitTimeSeconds: 0,
      resendCount: 0,
      error: 'Failed to generate verification code. Please try again.',
    })
  }

  const verification = result.verification

  // Calculate resend timing (handles expiration internally)
  const timing = Actions.auth.resendEmailVerification.calculateResendTiming(verification)

  return ctx.inertia.render('auth/verify-email', {
    email: user.email,
    attemptsRemaining: verification.maxAttempts - verification.attempts,
    waitTimeSeconds: timing.waitTimeSeconds,
    resendCount: verification.resendCount,
    expiresAt: verification.expiresAt.toISOString(),
  })
}

/**
 * Handles email verification with OTP
 * @param ctx - The HTTP request context
 * @returns An HTTP response for OTP verification
 */
export const handleEmailVerification = async (ctx: HttpContext) => {
  const user = ctx.auth.user

  if (!user) {
    return ctx.response.redirect().toRoute('auth.login')
  }

  // Redirect to home if user is already verified
  if (user.emailVerifiedAt) {
    return ctx.response.redirect().toRoute('home')
  }

  // Validate OTP code format
  const { otpCode } = await ctx.request.validateUsing(emailVerificationValidator)

  const result = await Actions.auth.verifyEmailOtp.handle({
    userId: user.id,
    otpCode,
  })

  if (result.success) {
    ctx.session.flash('success', 'Email verified! Welcome to the platform.')
    return ctx.response.redirect().toRoute('home')
  }

  if (result.errors) {
    ctx.session.flash('errorsBag', result.errors)
  }

  return ctx.response.redirect().back()
}

/**
 * Handles resending verification OTP
 * @param ctx - The HTTP request context
 * @returns An HTTP response for resending OTP
 */
export const handleResendVerification = async (ctx: HttpContext) => {
  const user = ctx.auth.user

  if (!user) {
    return ctx.response.redirect().toRoute('auth.login')
  }

  // Redirect to home if user is already verified
  if (user.emailVerifiedAt) {
    return ctx.response.redirect().toRoute('home')
  }

  const result = await Actions.auth.resendEmailVerification.handle({ userId: user.id })

  if (result.success && result.message) {
    ctx.session.flash('success', result.message)
  } else if (result.errors) {
    ctx.session.flash('errorsBag', result.errors)
  }

  return ctx.response.redirect().back()
}
