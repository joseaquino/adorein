import { db } from '#database/db'
import { users } from '#database/schema/users'
import { newAccountValidator } from '#validators/account_validator'
import { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import type { Infer } from '@vinejs/vine/types'

type Params = {
  data: Infer<typeof newAccountValidator>
}

export async function handle({ data }: Params) {
  const { session } = HttpContext.getOrFail()
  try {
    // Hash the password before storing
    const hashedPassword = await hash.make(data.password)

    // Create unverified user account
    const [user] = await db
      .insert(users)
      .values({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        emailVerifiedAt: null, // Explicitly unverified
        verificationSource: 'email',
      })
      .returning()

    session.flash('success', 'Your account has been created. Please verify your email.')

    // Do NOT login user yet - they need to verify email first
    return user
  } catch (error) {
    // Log the error
    throw new Error('Could not create account.')
  }
}
