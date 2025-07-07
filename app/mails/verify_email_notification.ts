import { EmailVerificationWith } from '#database/schema/user_email_verifications'
import { calculateTimeToExpiry } from '#shared/utils/time'
import env from '#start/env'
import { BaseMail } from '@adonisjs/mail'

export default class VerifyEmailNotification extends BaseMail {
  constructor(private verificationData: EmailVerificationWith<'user'>) {
    super()
  }

  /**
   * Prepare the email message
   */
  prepare() {
    // Calculate expiration minutes from expiresAt timestamp
    const expirationSeconds = calculateTimeToExpiry(this.verificationData.expiresAt.toISOString())
    const expirationMinutes = Math.ceil(expirationSeconds / 60)

    const templateData = {
      firstName: this.verificationData.user.firstName,
      email: this.verificationData.user.email,
      otpCode: this.verificationData.otpCode,
      expirationMinutes: Math.max(0, expirationMinutes), // Ensure non-negative
    }

    this.message
      .to(this.verificationData.user.email)
      .from(
        env.get('RESEND_FROM_EMAIL', 'noreply@yourapp.com'),
        env.get('RESEND_FROM_NAME', 'Your App')
      )
      .subject('Verify your email address')
      .htmlView('emails/verify_email', templateData)
      .textView('emails/verify_email_text', templateData)
  }
}
