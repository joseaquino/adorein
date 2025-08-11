import Actions from '#actions/index'
import { updateProfileValidator } from '#validators/account_validator'
import { HttpContext } from '@adonisjs/core/http'

/**
 * Handles the HTTP request for updating user profile information
 * @param ctx - The HTTP request context
 * @returns An HTTP response with success or validation errors
 */
export const handleProfileUpdate = async (ctx: HttpContext) => {
  const { request, response, auth, session } = ctx

  // Validate the incoming data - validation errors are handled automatically by AdonisJS
  const data = await request.validateUsing(updateProfileValidator, {
    meta: {
      userId: auth.user!.id,
    },
  })

  // Update the user profile
  const result = await Actions.users.updateProfile.handle({
    userId: auth.user!.id,
    data,
  })

  if (result.success) {
    session.flash('message', 'Profile updated successfully')
    return response.redirect().back()
  } else {
    session.flash('error', result.errors.general)
    return response.redirect().back()
  }
}
