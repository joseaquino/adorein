import { db } from '#database/db'
import { userThirdPartyAuths } from '#database/schema/user_third_party_auths'
import { User, users } from '#database/schema/users'
import { emailValidator } from '#validators/account_validator'
import { SocialProviders } from '@adonisjs/ally/types'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { and, eq } from 'drizzle-orm'

type ActionResponse =
  | { success: true; user: User; redirectTo: string; providerId?: string }
  | { success: false; redirectTo: string; flash?: { message: string; type: 'error' | 'success' } }

@inject()
export default class HandleOauthCallback {
  constructor(protected ctx: HttpContext) {}

  async handle(): Promise<ActionResponse> {
    const { ally, params, auth, session } = this.ctx

    const providers = Object.keys(ally.config) as Array<keyof SocialProviders>
    const targetProvider = providers.find((provider) => provider === params.provider)

    if (!targetProvider) {
      return {
        success: false,
        redirectTo: 'register',
        flash: { type: 'error', message: `Invalid OAuth provider: ${params.provider}` },
      }
    }

    const providerInstance = ally.use(targetProvider)

    if (providerInstance.hasError()) {
      return {
        success: false,
        redirectTo: 'register',
        flash: { type: 'error', message: providerInstance.getError()! },
      }
    }

    const providerUser = await providerInstance.user()

    try {
      await vine.validate({ schema: emailValidator, data: { email: providerUser.email } })
    } catch (error) {
      return {
        success: false,
        redirectTo: 'register',
        flash: { type: 'error', message: 'Invalid email from OAuth provider.' },
      }
    }

    const userOAuth = await db.query.userThirdPartyAuths.findFirst({
      where: and(
        eq(userThirdPartyAuths.provider, params.provider),
        eq(userThirdPartyAuths.providerId, providerUser.id)
      ),
      with: {
        user: true,
      },
    })

    if (userOAuth?.user) {
      await auth.use('web').login(userOAuth.user)
      return { success: true, user: userOAuth.user, redirectTo: 'home' }
    }

    return db.transaction(async (tx) => {
      let currentOAuth = userOAuth
      if (!currentOAuth) {
        const [created] = await tx
          .insert(userThirdPartyAuths)
          .values({
            provider: params.provider,
            providerId: providerUser.id,
            payload: JSON.stringify(providerUser),
          })
          .returning()

        currentOAuth = await tx.query.userThirdPartyAuths.findFirst({
          where: eq(userThirdPartyAuths.id, created.id),
          with: { user: true },
        })

        if (!currentOAuth) {
          tx.rollback()
          return {
            success: false,
            redirectTo: 'register',
            flash: { type: 'error', message: 'Failed to create OAuth user.' },
          }
        }
      } else {
        await tx
          .update(userThirdPartyAuths)
          .set({ payload: JSON.stringify(providerUser) })
          .where(eq(userThirdPartyAuths.id, currentOAuth.id))
      }

      const newAccountData = session.pull('isNewAccount', false)
      const existingUser = await tx.query.users.findFirst({
        where: eq(users.email, providerUser.email),
      })

      if (newAccountData && existingUser) {
        session.put('existingAccount', {
          providerId: currentOAuth.id,
          userId: existingUser.id,
        })
        return { success: false, redirectTo: 'auth.register' }
      }

      const [firstName = '', ...lastNameParts] = providerUser.name.split(' ').filter(Boolean)
      const lastName = lastNameParts.join(' ')

      const [newUser] = await tx
        .insert(users)
        .values({
          email: providerUser.email,
          firstName,
          lastName,
        })
        .returning()

      await tx
        .update(userThirdPartyAuths)
        .set({ userId: newUser.id })
        .where(eq(userThirdPartyAuths.id, currentOAuth.id))

      await auth.use('web').login(newUser)

      return {
        success: true,
        user: newUser,
        redirectTo: 'new-oauth-user',
        providerId: currentOAuth.id,
      }
    })
  }
}
