import { db } from '#database/db'
import { users } from '#database/schema/users'
import { newOAuthAccountValidator } from '#validators/account_validator'
import { HttpContext } from '@adonisjs/core/http'
import { eq } from 'drizzle-orm'

type ActionResponse =
  | { success: true; user: typeof users.$inferSelect }
  | { success: false; redirectTo: string }

export default class UpdateNewOauthUser {
  static async handle(): Promise<ActionResponse> {
    const { params, request, auth } = HttpContext.getOrFail()

    const userOAuth = await db.query.userThirdPartyAuths.findFirst({
      where: (thirdPartyAuth, operators) => operators.eq(thirdPartyAuth.id, params.providerId),
      with: {
        user: true,
      },
    })

    if (!userOAuth || !userOAuth.user) {
      return { success: false, redirectTo: 'auth.register' }
    }

    const userData = await request.validateUsing(newOAuthAccountValidator, {
      meta: { userId: userOAuth.user.id },
    })

    await db.update(users).set(userData).where(eq(users.id, userOAuth.user.id))

    const updatedUser = { ...userOAuth.user, ...userData }
    await auth.use('web').login(updatedUser)

    return { success: true, user: updatedUser }
  }
}
