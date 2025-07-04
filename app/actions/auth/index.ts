import * as findOrCreateEmailVerification from './find_or_create_email_verification.js'
import * as generateEmailVerificationOtp from './generate_email_verification_otp.js'
import * as getOauthUserForUpdate from './get_oauth_user_for_update.js'
import * as handleOauthCallback from './handle_oauth_callback.js'
import * as identifyAccount from './identify_account.js'
import * as loginUser from './login_user.js'
import * as logoutUser from './logout_user.js'
import * as registerUser from './register_user.js'
import * as registerUserWithSocialProvider from './register_user_with_social_provider.js'
import * as resendEmailVerification from './resend_email_verification.js'
import * as updateNewOauthUser from './update_new_oauth_user.js'
import * as verifyEmailOtp from './verify_email_otp.js'

export default {
  findOrCreateEmailVerification,
  generateEmailVerificationOtp,
  getOauthUserForUpdate,
  handleOauthCallback,
  identifyAccount,
  loginUser,
  logoutUser,
  registerUser,
  registerUserWithSocialProvider,
  resendEmailVerification,
  updateNewOauthUser,
  verifyEmailOtp,
}
