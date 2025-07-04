import { db } from '#database/db'
import { userEmailVerifications, users } from '#database/schema'
import { and, eq, gt } from 'drizzle-orm'

type Params = {
  userId: string
  otpCode: string
}

export async function handle({ userId, otpCode }: Params) {
  // Find active verification record
  const verification = await db.query.userEmailVerifications.findFirst({
    where: and(
      eq(userEmailVerifications.userId, userId),
      gt(userEmailVerifications.expiresAt, new Date())
    ),
  })

  if (!verification) {
    return { success: false, errors: { otp: 'Verification code expired or not found' } }
  }

  // Check max attempts
  if (verification.attempts >= verification.maxAttempts) {
    return { success: false, errors: { otp: 'Maximum verification attempts exceeded' } }
  }

  // Increment attempts
  await db
    .update(userEmailVerifications)
    .set({
      attempts: verification.attempts + 1,
      updatedAt: new Date(),
    })
    .where(eq(userEmailVerifications.id, verification.id))

  // Validate OTP
  if (verification.otpCode !== otpCode) {
    return {
      success: false,
      errors: { otp: 'Invalid verification code' },
      attemptsRemaining: verification.maxAttempts - verification.attempts - 1,
    }
  }

  // Mark user as verified
  await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.id, userId))

  // Clean up verification record
  await db.delete(userEmailVerifications).where(eq(userEmailVerifications.id, verification.id))

  return { success: true, message: 'Email verified successfully' }
}
