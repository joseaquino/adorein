import { db } from '#database/db'
import { userEmailVerifications } from '#database/schema'
import { eq } from 'drizzle-orm'

type Params = {
  userId: string
  preserveResendCount?: boolean
}

export async function handle({ userId, preserveResendCount = false }: Params) {
  // Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

  // Set expiration (15 minutes)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
  const now = new Date()

  // Get existing record if preserveResendCount is true
  let existingRecord = null
  if (preserveResendCount) {
    existingRecord = await db.query.userEmailVerifications.findFirst({
      where: eq(userEmailVerifications.userId, userId),
    })
  }

  // Try to update existing record first
  const [updated] = await db
    .update(userEmailVerifications)
    .set({
      otpCode,
      expiresAt,
      lastSentAt: now,
      resendCount: preserveResendCount && existingRecord ? existingRecord.resendCount + 1 : 0,
      attempts: 0, // Reset attempts on new OTP generation
      updatedAt: now,
    })
    .where(eq(userEmailVerifications.userId, userId))
    .returning()

  // If no record was updated, insert a new one
  let verification
  if (!updated) {
    const [inserted] = await db
      .insert(userEmailVerifications)
      .values({
        userId,
        otpCode,
        expiresAt,
        lastSentAt: now,
        resendCount: 0,
      })
      .returning()

    verification = inserted
  } else {
    verification = updated
  }

  return { success: true, verification, otpCode }
}
