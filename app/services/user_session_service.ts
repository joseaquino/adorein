import { db } from '#database/db'
import { UserThirdPartyAuth } from '#database/schema/user_third_party_auths'
import { User } from '#database/schema/users'
import { HttpContext } from '@adonisjs/core/http'

interface ExistingAccount {
  user: User | undefined
  socialProvider: UserThirdPartyAuth | undefined
}

/**
 * Checks for an existing user and social provider in the session,
 * and returns them if they exist.
 * @returns The existing user and social provider if they exist
 */
export const checkForExistingUser = async ({
  session,
  logger,
}: HttpContext): Promise<ExistingAccount> => {
  const existingAccount = session.get('existingAccount', {})

  if (existingAccount.modalShown) {
    session.forget('existingAccount')
  } else {
    session.put('existingAccount', { modalShown: true })
  }

  logger.info('Checking for existing user account', existingAccount)

  let user: User | undefined
  let provider: UserThirdPartyAuth | undefined

  if (existingAccount.userId) {
    user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, existingAccount.userId),
    })
  }

  if (existingAccount.providerId) {
    provider = await db.query.userThirdPartyAuths.findFirst({
      where: (userThirdPartyAuths, { eq }) =>
        eq(userThirdPartyAuths.id, existingAccount.providerId),
    })
  }

  return {
    user,
    socialProvider: provider,
  }
}
