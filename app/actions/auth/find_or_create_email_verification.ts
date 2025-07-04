import { db } from '#database/db'
import { UserEmailVerification, userEmailVerifications } from '#database/schema'
import { eq } from 'drizzle-orm'
import * as generateEmailVerificationOtp from './generate_email_verification_otp.ts'

type Params = {
  userId: string
}

type SuccessResult = {
  success: true
  verification: UserEmailVerification
  wasCreated: boolean
}

type FailureResult = {
  success: false
  errors: { general: string }
}

/**
 * Finds an existing email verification record or creates a new one
 *
 * This action encapsulates the common pattern of:
 * 1. Looking for an existing verification record
 * 2. Creating one if none exists
 * 3. Returning the verification record for use
 *
 * @param params - Object containing userId
 * @returns Success/failure result with verification record
 */
export async function handle({ userId }: Params): Promise<SuccessResult | FailureResult> {
  // Try to find existing verification record
  let verification = await db.query.userEmailVerifications.findFirst({
    where: eq(userEmailVerifications.userId, userId),
  })

  // Indicates if a new record was created
  let wasCreated = false

  // If no verification exists, create one
  if (!verification) {
    const result = await generateEmailVerificationOtp.handle({ userId })

    if (!result.success) {
      return {
        success: false,
        errors: { general: 'Failed to generate verification code' },
      }
    }

    verification = result.verification
    wasCreated = true
  }

  return {
    success: true,
    verification,
    wasCreated,
  }
}
