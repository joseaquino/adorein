import { db } from '#database/db'
import { User } from '#database/schema/users'

interface Payload {
  email: string | undefined
}

type ActionResopnse =
  | {
      success: true
      user: User
    }
  | {
      success: false
      errors: { email?: string }
    }

export const handle = async (payload: Payload): Promise<ActionResopnse> => {
  const { email } = payload

  if (!email) {
    return { success: false, errors: { email: 'You must provide an email' } }
  }

  const user = await db.query.users.findFirst({
    where: (_user, operators) => operators.eq(_user.email, email),
  })

  if (!user) {
    return { success: false, errors: { email: 'We were unable to find your account.' } }
  }

  return { success: true, user }
}
