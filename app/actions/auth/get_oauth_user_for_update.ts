import { db } from '#database/db'
import { HttpContext } from '@adonisjs/core/http'

type OAuthUserData = {
  providerId: string
  provider: string
  email: string
  firstName: string
  lastName: string
}

type ActionResponse = { success: true; data: OAuthUserData } | { success: false }

export default class GetOauthUserForUpdate {
  static async handle(): Promise<ActionResponse> {
    const { params } = HttpContext.getOrFail()

    const userOAuth = await db.query.userThirdPartyAuths.findFirst({
      where: (tpa, { eq }) => eq(tpa.id, params.providerId),
      with: {
        user: true,
      },
    })

    if (!userOAuth || !userOAuth.user) {
      return { success: false }
    }

    return {
      success: true,
      data: {
        providerId: userOAuth.id,
        provider: userOAuth.provider,
        email: userOAuth.user.email,
        firstName: userOAuth.user.firstName,
        lastName: userOAuth.user.lastName,
      },
    }
  }
}
