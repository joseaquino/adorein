import User from '#models/user'
import UserThirdPartyAuth from '#models/user_third_party_auth'
import { newAccountValidator, newOAuthAccountValidator } from '#validators/account_validator'
import { SocialProviders } from '@adonisjs/ally/types'
import { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  index({ inertia }: HttpContext) {
    return inertia.render('auth/login')
  }

  async create({ inertia, ally, session }: HttpContext) {
    const providerNames = Object.keys(ally.config) as Array<keyof typeof ally.config>

    const providers = providerNames.map((name) => {
      return {
        name,
        url: ally.use(name).getRedirectUrl(),
      }
    })

    const existingAccount = session.get('existingAccount', {})

    if (existingAccount.modalShown) {
      session.forget('existingAccount')
    } else {
      session.put('existingAccount', { modalShown: true })
    }

    let user: User | null = null
    let provider: UserThirdPartyAuth | null = null

    if (existingAccount.userId) {
      user = await User.find(existingAccount.userId)
    }

    if (existingAccount.providerId) {
      provider = await UserThirdPartyAuth.find(existingAccount.providerId)
    }

    return inertia.render('auth/register', {
      providers,
      existingAccount: { email: user?.email, providerName: provider?.provider },
    })
  }

  async store({ session, request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(newAccountValidator)

    const user = await User.create(payload)

    session.flash('success', 'Your account has been created. Please login.')

    await auth.use('web').login(user)

    return response.redirect().toRoute('home')
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()

    return response.redirect().toRoute('login')
  }

  async registerWithOAuthProvider({ ally, session, params, response, inertia }: HttpContext) {
    const enabledProviders = Object.keys(ally.config) as Array<keyof SocialProviders>
    const targetProvider = enabledProviders.find((provider) => provider === params.provider)

    if (!targetProvider) {
      session.flash('error', 'Invalid OAuth provider')
      return response.redirect().toRoute('register')
    }

    const providerInstance = ally.use(targetProvider)

    session.put('isNewAccount', true)

    const redirectUrl = await providerInstance.getRedirectUrl()

    return inertia.location(redirectUrl)
  }

  async viewNewOAuthUser({ inertia, params, response }: HttpContext) {
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

  async updateNewOAuthUser({ params, request, response, auth }: HttpContext) {
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

  async oauth({ ally, params, response, auth, session }: HttpContext) {
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
        return response.redirect().toRoute('register')
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

  async providers({ inertia, session, request, response, auth, ally }: HttpContext) {
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
}
