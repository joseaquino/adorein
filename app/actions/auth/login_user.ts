import Actions from '#actions/index'
import type { User } from '#database/schema/users'
import type { SocialProviders } from '@adonisjs/ally/types'
import { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'

type ActionResponse =
  | {
      success: false
      errors: { email?: string; password?: string }
      authProviders?: { name: string; url: string }[]
      userEmail?: string
    }
  | { success: true; user: User }

interface Payload {
  email: string | undefined
  password: string | undefined
}

export async function handle(payload: Payload): Promise<ActionResponse> {
  const { email, password } = payload

  const { ally } = HttpContext.getOrFail()

  const result = await Actions.users.getUserWithAuthProviders.handle({ email })

  if (!result.success) {
    return result
  }

  const { user } = result

  const providerPromises = user.thirdPartyAuths.map(async (oauthProvider) => ({
    name: oauthProvider.provider,
    url: await ally.use(oauthProvider.provider as keyof SocialProviders).getRedirectUrl(),
  }))

  const authProviders = await Promise.all(providerPromises)

  if (user.password) {
    authProviders.push({ name: 'password', url: '' })
  } else {
    return { success: false, errors: { password: 'Your account is missing a password.' } }
  }

  if (!password) {
    return {
      success: false,
      errors: { password: 'Please provide your password.' },
      userEmail: user.email,
      authProviders,
    }
  }

  const isPasswordValid = await hash.verify(user.password, password)

  if (!isPasswordValid) {
    return {
      success: false,
      errors: { password: 'The password you provided is incorrect.' },
      userEmail: user.email,
      authProviders,
    }
  }

  return { success: true, user }
}
