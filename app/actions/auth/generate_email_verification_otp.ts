import { db } from '#database/db'
import { UserEmailVerification, userEmailVerifications } from '#database/schema'
import VerifyEmailNotification from '#mails/verify_email_notification'
import mail from '@adonisjs/mail/services/main'
import { eq } from 'drizzle-orm'

type Params = {
  userId: string
  preserveResendCount?: boolean
}

interface FailureResult {
  success: false
  errors: {
    general: string
  }
}

interface SuccessResult {
  success: true
  verification: UserEmailVerification
  emailSent: boolean
  emailError: string | undefined
}

type Result = FailureResult | SuccessResult

export async function handle({ userId, preserveResendCount = false }: Params): Promise<Result> {
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
  let verification: UserEmailVerification
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

  // Fetch the email verification with user data for email delivery
  const verificationWithUser = await db.query.userEmailVerifications.findFirst({
    where: eq(userEmailVerifications.id, verification.id),
    with: {
      user: true,
    },
  })

  if (!verificationWithUser) {
    return { success: false, errors: { general: 'Email verification record not found' } }
  }

  // Send OTP verification email
  let emailSent = false
  let emailError: string | undefined

  try {
    const notification = new VerifyEmailNotification(verificationWithUser)
    await mail.send(notification)
    emailSent = true
  } catch (error) {
    // Note: We don't fail the entire operation if email fails
    // The OTP is still valid and user can request resend
    console.error('Failed to send OTP verification email:', error)
    emailError = error instanceof Error ? error.message : 'Unknown email delivery error'
  }

  return {
    success: true,
    verification,
    emailSent,
    emailError,
  }
}
