import vine from '@vinejs/vine'

/**
 * Email verification OTP validator
 *
 * Validates 6-digit numeric OTP codes for email verification.
 * The OTP code must be exactly 6 digits and contain only numbers.
 */
export const emailVerificationValidator = vine.compile(
  vine.object({
    otpCode: vine
      .string()
      .fixedLength(6)
      .regex(/^\d{6}$/),
  })
)
