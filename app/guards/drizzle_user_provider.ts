import { db } from '#database/db'
import { User } from '#database/schema/users'
import { symbols } from '@adonisjs/auth'
import hash from '@adonisjs/core/services/hash'

export interface DrizzleUserProviderConfig {
  uids: string[]
}

class DrizzleGuardUser {
  constructor(private user: User) {}

  getId() {
    return this.user.id
  }

  getOriginal() {
    return this.user
  }

  // Proxy all other properties to the original user
  get id() {
    return this.user.id
  }
  get firstName() {
    return this.user.firstName
  }
  get lastName() {
    return this.user.lastName
  }
  get email() {
    return this.user.email
  }
  get password() {
    return this.user.password
  }
  get createdAt() {
    return this.user.createdAt
  }
  get updatedAt() {
    return this.user.updatedAt
  }
}

export class DrizzleUserProvider {
  declare [symbols.PROVIDER_REAL_USER]: User

  constructor(public config: DrizzleUserProviderConfig) {}

  async createUserForGuard(user: User): Promise<DrizzleGuardUser> {
    return new DrizzleGuardUser(user)
  }

  async findById(identifier: string | number): Promise<DrizzleGuardUser | null> {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, String(identifier)),
    })
    return user ? new DrizzleGuardUser(user) : null
  }

  async verifyCredentials(uid: string, password: string): Promise<DrizzleGuardUser | null> {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, uid),
    })

    if (!user || !user.password) {
      return null
    }

    const isValid = await hash.verify(user.password, password)
    return isValid ? new DrizzleGuardUser(user) : null
  }
}

export function drizzleUserProvider(config: DrizzleUserProviderConfig) {
  return {
    type: 'provider' as const,
    config,
    resolver: async () => {
      return new DrizzleUserProvider(config)
    },
  }
}
