import User from '#models/user'
import UserThirdPartyAuth from '#models/user_third_party_auth'
import { HttpContext } from '@adonisjs/core/http'

interface ExistingAccount {
  user: User | null
  socialProvider: UserThirdPartyAuth | null
}

/**
 * Checks for an existing user and social provider in the session,
 * and returns them if they exist.
 * @returns The existing user and social provider if they exist
 */
export const checkForExistingUser = async ({ session }: HttpContext): Promise<ExistingAccount> => {
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

  return {
    user,
    socialProvider: provider,
  }
}
