import { db } from '#database/db'
import { userEmailVerifications } from '#database/schema'
import { eq } from 'drizzle-orm'
import * as generateEmailVerificationOtp from './generate_email_verification_otp.ts'

type Params = {
  userId: string
}

type VerificationRecord = {
  resendCount: number
  lastSentAt: Date
  expiresAt: Date
}

export type ResendTiming = {
  backoffSeconds: number
  canResendAt: Date
  waitTimeSeconds: number
  canResend: boolean
}

/**
 * Calculates exponential backoff timing for OTP resend requests
 *
 * Implements progressive delays to prevent spam:
 * - 1st resend: 30 seconds
 * - 2nd resend: 1 minute
 * - 3rd resend: 2 minutes
 * - 4th resend: 4 minutes
 * - 5th resend: 8 minutes
 * - 6th+ resend: 10 minutes (max)
 *
 * If the OTP is expired, returns reset timing (immediate resend available)
 *
 * @param verification - Verification record with resendCount, lastSentAt, and expiresAt
 * @returns Object with timing calculations and resend availability
 */
export function calculateResendTiming(verification: VerificationRecord): ResendTiming {
  const now = new Date()

  // If OTP is expired, reset timing (allow immediate resend)
  const isExpired = verification.expiresAt <= now
  if (isExpired) {
    return {
      backoffSeconds: 0,
      canResendAt: now,
      waitTimeSeconds: 0,
      canResend: true,
    }
  }

  // Calculate backoff time (exponential: 30s, 1m, 2m, 4m, 8m, max 10m)
  const backoffSeconds = Math.min(30 * Math.pow(2, verification.resendCount), 600)
  const canResendAt = new Date(verification.lastSentAt.getTime() + backoffSeconds * 1000)
  const waitTimeSeconds =
    now < canResendAt ? Math.ceil((canResendAt.getTime() - now.getTime()) / 1000) : 0

  return {
    backoffSeconds,
    canResendAt,
    waitTimeSeconds,
    canResend: waitTimeSeconds === 0,
  }
}

export async function handle({ userId }: Params) {
  // Find existing verification record
  const verification = await db.query.userEmailVerifications.findFirst({
    where: eq(userEmailVerifications.userId, userId),
  })

  if (!verification) {
    return { success: false, errors: { general: 'No pending verification found' } }
  }

  // Check if the current OTP is expired
  const isExpired = verification.expiresAt <= new Date()

  // If expired, reset everything (don't preserve resend count, don't check timing)
  if (isExpired) {
    const result = await generateEmailVerificationOtp.handle({
      userId,
      preserveResendCount: false, // Reset resend count for expired OTPs
    })

    if (!result.success) {
      return { success: false, errors: { general: 'Failed to generate new verification code' } }
    }

    // TBD: Send new OTP email
    // await EmailService.sendOTPVerification(user.email, result.otpCode)

    return { success: true, message: 'New verification code sent', otpCode: result.otpCode }
  }

  // For non-expired OTPs, use normal resend logic with timing checks
  const timing = calculateResendTiming(verification)

  if (!timing.canResend) {
    return {
      success: false,
      errors: {
        general: `Please wait ${timing.waitTimeSeconds} seconds before requesting a new code`,
      },
      waitTimeSeconds: timing.waitTimeSeconds,
    }
  }

  // Generate new OTP using the dedicated action (preserves resend count)
  const result = await generateEmailVerificationOtp.handle({
    userId,
    preserveResendCount: true,
  })

  if (!result.success) {
    return { success: false, errors: { general: 'Failed to generate new verification code' } }
  }

  // TBD: Send new OTP email
  // await EmailService.sendOTPVerification(user.email, result.otpCode)

  return { success: true, message: 'New verification code sent', otpCode: result.otpCode }
}
