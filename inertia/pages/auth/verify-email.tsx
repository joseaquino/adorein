import { useForm } from '@inertiajs/react'
import { useRef } from 'react'
import Alert from '~/app/components/feedback/alert'
import Button from '~/app/components/form/button'
import OtpInput, { OtpInputRef } from '~/app/components/form/otp-input'
import { useTimer } from '~/app/hooks/use_timer'
import AuthLayout from '~/app/layouts/auth.layout'
import { calculateTimeToExpiry } from '~/app/utils/time'

interface VerifyEmailPageProps {
  email: string
  attemptsRemaining: number
  waitTimeSeconds: number
  resendCount: number
  error?: string
  expiresAt: string
}

const VerifyEmailPage = (props: VerifyEmailPageProps) => {
  const { email, attemptsRemaining, waitTimeSeconds, resendCount, error, expiresAt } = props
  const { data, setData, post, errors, processing } = useForm({ otpCode: '' })

  // Use separate timers for expiration and resend functionality
  const expirationTimer = useTimer(calculateTimeToExpiry(expiresAt))
  const resendTimer = useTimer(waitTimeSeconds)

  const otpInputRef = useRef<OtpInputRef>(null)

  // Derive states from timer values
  const isClientExpired = expirationTimer.secondsRemaining <= 0
  const canResend = resendTimer.secondsRemaining <= 0 || isClientExpired

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    post('/auth/verify-email', {
      onError: () => {
        setData('otpCode', '') // Clear the OTP input on verification failure
        // Focus the first input after clearing - setTimeout ensures this runs after
        // the React state update has been processed and the DOM has been updated.
        // Without this, focusFirst() might try to focus an input that still contains
        // the old value, causing the focus to behave unexpectedly.
        setTimeout(() => {
          otpInputRef.current?.focusFirst()
        }, 0)
      },
    })
  }

  const handleResend = () => {
    if (canResend) {
      post('/auth/resend-verification', {
        onSuccess: () => {
          setData('otpCode', '') // Clear the OTP input
        },
      })
    }
  }

  const handleLogout = () => {
    post('/auth/logout', {
      onError: () => {
        // Handle any errors during logout
        console.error('Logout failed')
      },
    })
  }

  const handleOtpChange = (value: string) => {
    setData('otpCode', value)
  }

  const isAttemptsExhausted = attemptsRemaining <= 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2">
        <p className="text-gray-600">We've sent a 6-digit verification code to</p>
        <div className="flex items-center border border-gray-300 rounded-md bg-gray-50 max-w-md">
          <div className="px-4 py-2 flex-1 text-center font-semibold text-indigo-600">{email}</div>
          <button
            onClick={handleLogout}
            className="px-3 py-3 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 border-l border-gray-300 transition-colors"
            disabled={processing}
          >
            logout
          </button>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {isClientExpired ? (
        <Alert
          variant="warning"
          style="dialog"
          title="Verification code expired"
          action={{
            label: processing ? 'Generating...' : 'Generate new code',
            onClick: handleResend,
            disabled: processing,
          }}
        >
          Your verification code has expired. Please generate a new one to continue.
        </Alert>
      ) : isAttemptsExhausted ? (
        <Alert
          variant="warning"
          style="dialog"
          title="OTP attempts exhausted"
          action={{
            label: processing
              ? 'Generating...'
              : canResend
                ? 'Generate new code'
                : `Resend available in ${resendTimer.formattedTime}`,
            onClick: handleResend,
            disabled: processing || !canResend,
          }}
        >
          You have exceeded the maximum number of verification attempts. Please request a new code
          to continue.
        </Alert>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <OtpInput
            ref={otpInputRef}
            label="Verification Code:"
            name="otpCode"
            value={data.otpCode}
            onChange={handleOtpChange}
            error={errors.otpCode}
            length={6}
            autoFocus={true}
          />

          <Button
            type="submit"
            fullWidth
            disabled={processing || data.otpCode.length !== 6}
            className="mt-2"
          >
            {processing ? 'Verifying...' : 'Verify Email'}
          </Button>
        </form>
      )}

      {!isClientExpired && !isAttemptsExhausted && (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">
            Code expires in:{' '}
            <span className="font-mono text-orange-600">{expirationTimer.formattedTime}</span> and
            you have <span className="text-orange-600">{attemptsRemaining}</span> attempts remaining
          </p>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600">Didn't receive the code?</p>
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                disabled={processing}
              >
                Resend verification code
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Resend available in {resendTimer.formattedTime}
                {resendCount > 0 && (
                  <span className="text-xs text-gray-400 block">(Attempt {resendCount + 1})</span>
                )}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

VerifyEmailPage.layout = (page: React.ReactNode) => (
  <AuthLayout title="Verify Email">{page}</AuthLayout>
)

export default VerifyEmailPage
