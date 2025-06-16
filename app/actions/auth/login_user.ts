import { db } from '#database/db'
import type { users } from '#database/schema/users'
import type { SocialProviders } from '@adonisjs/ally/types'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'

type ActionResponse =
  | {
      success: false
      errors: { email?: string; password?: string }
      authProviders?: { name: string; url: string }[]
      userEmail?: string
    }
  | { success: true; user: typeof users.$inferSelect }

@inject()
export default class LoginUser {
  constructor(protected ctx: HttpContext) {}

  async handle(): Promise<ActionResponse> {
    const { request, auth, ally } = this.ctx

    const email = request.input('email')
    const password = request.input('password')

    if (!email) {
      return { success: false, errors: { email: 'Please provide your email address.' } }
    }

    const user = await db.query.users.findFirst({
      where: (u, operators) => operators.eq(u.email, email),
      with: {
        thirdPartyAuths: true,
      },
    })

    if (!user) {
      return { success: false, errors: { email: 'We were unable to find your account.' } }
    }

    if (password === undefined) {
      const providerPromises = user.thirdPartyAuths.map(async (oauthProvider) => ({
        name: oauthProvider.provider,
        url: await ally.use(oauthProvider.provider as keyof SocialProviders).getRedirectUrl(),
      }))

      const authProviders = await Promise.all(providerPromises)

      if (user.password) {
        authProviders.push({ name: 'password', url: '' })
      }
      return { success: false, errors: {}, userEmail: user.email, authProviders }
    }

    if (!user.password) {
      return { success: false, errors: { password: 'Your account is missing a password.' } }
    }

    if (password === null) {
      return { success: false, errors: { password: 'Please provide your password.' } }
    }

    const isPasswordValid = await hash.verify(user.password, password)

    if (!isPasswordValid) {
      return { success: false, errors: { password: 'The password you provided is incorrect.' } }
    }

    await auth.use('web').login(user)

    return { success: true, user }
  }
}
