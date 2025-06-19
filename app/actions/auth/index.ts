import * as getOauthUserForUpdate from './get_oauth_user_for_update.js'
import * as handleOauthCallback from './handle_oauth_callback.js'
import * as identifyAccount from './identify_account.js'
import * as loginUser from './login_user.js'
import * as logoutUser from './logout_user.js'
import * as registerUser from './register_user.js'
import * as registerUserWithSocialProvider from './register_user_with_social_provider.js'
import * as updateNewOauthUser from './update_new_oauth_user.js'

export default {
  getOauthUserForUpdate,
  handleOauthCallback,
  identifyAccount,
  loginUser,
  logoutUser,
  registerUser,
  registerUserWithSocialProvider,
  updateNewOauthUser,
}
