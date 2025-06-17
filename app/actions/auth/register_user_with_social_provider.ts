import type { SocialProviders } from '@adonisjs/ally/types'
import { HttpContext } from '@adonisjs/core/http'

type Params = {
  provider: string
}

export async function handle({ provider }: Params) {
    const { ally, session } = HttpContext.getOrFail()

    const enabledProviders = Object.keys(ally.config) as Array<keyof SocialProviders>
    const targetProvider = enabledProviders.find((p) => p === provider)

    if (!targetProvider) {
      throw new Error('Invalid OAuth provider')
    }

    const providerInstance = ally.use(targetProvider)

    session.put('isNewAccount', true)

    return providerInstance.getRedirectUrl()
}
