import type { SocialProviders } from '@adonisjs/ally/types'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

type Params = {
  provider: string
}

@inject()
export default class RegisterUserWithSocialProvider {
  constructor(protected ctx: HttpContext) {}

  async handle({ provider }: Params) {
    const { ally, session } = this.ctx

    const enabledProviders = Object.keys(ally.config) as Array<keyof SocialProviders>
    const targetProvider = enabledProviders.find((p) => p === provider)

    if (!targetProvider) {
      throw new Error('Invalid OAuth provider')
    }

    const providerInstance = ally.use(targetProvider)

    session.put('isNewAccount', true)

    return providerInstance.getRedirectUrl()
  }
}
