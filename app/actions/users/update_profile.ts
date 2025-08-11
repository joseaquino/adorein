import { db } from '#database/db'
import { users } from '#database/schema/users'
import { updateProfileValidator } from '#validators/account_validator'
import type { Infer } from '@vinejs/vine/types'
import { eq } from 'drizzle-orm'

type Params = {
  userId: string
  data: Infer<typeof updateProfileValidator>
}

interface FailureResult {
  success: false
  errors: {
    general: string
  }
}

interface SuccessResult {
  success: true
  user: any
}

type Result = FailureResult | SuccessResult

export async function handle({ userId, data }: Params): Promise<Result> {
  try {
    // Update user profile
    const [updatedUser] = await db
      .update(users)
      .set({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning()

    if (!updatedUser) {
      return {
        success: false,
        errors: {
          general: 'User not found',
        },
      }
    }

    return {
      success: true,
      user: updatedUser,
    }
  } catch (error) {
    console.error('Failed to update user profile:', error)
    return {
      success: false,
      errors: {
        general: 'An unexpected error occurred while updating your profile',
      },
    }
  }
}
