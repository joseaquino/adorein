import { db } from '#database/db'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

type OAuthUserData = {
  providerId: string
  provider: string
  email: string
  firstName: string
  lastName: string
}

type ActionResponse = { success: true; data: OAuthUserData } | { success: false }

@inject()
export default class GetOauthUserForUpdate {
  constructor(protected ctx: HttpContext) {}

  async handle(): Promise<ActionResponse> {
    const { params } = this.ctx

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
