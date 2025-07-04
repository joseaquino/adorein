/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import {
  handleAccountIdentification,
  handleEmailVerification,
  handleNewOAuthUserUpdate,
  handleOAuthCallback,
  handleResendVerification,
  handleUserLogin,
  handleUserLogout,
  renderAuthChallenge,
  renderEmailVerification,
  renderLogin,
  renderNewOAuthUser,
} from '#handlers/auth'
import {
  registerNewUser,
  registerNewUserWithSocialProvider,
  renderRegistrationForm,
} from '#handlers/register'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router.on('/docs').renderInertia('docs')

// HOME ROUTES

router.on('/').renderInertia('home').use([middleware.auth()]).as('home')

// AUTH ROUTES

router.post('/auth/logout', handleUserLogout).as('logout').use([middleware.auth()])

// Email verification routes (requires authenticated but unverified user)
router
  .group(() => {
    router.get('/verify-email', renderEmailVerification).as('auth.verify-email')
    router.post('/verify-email', handleEmailVerification)
    router.post('/resend-verification', handleResendVerification)
  })
  .prefix('/auth')
  .use([middleware.emailVerification()])

router.get('/oauth/:provider/callback', handleOAuthCallback).as('oauth').use([middleware.guest()])

router
  .post('/auth/new-oauth-user/:providerId', handleNewOAuthUserUpdate)
  .as('update-new-oauth-user')

router
  .group(() => {
    router.get('/login', renderLogin).as('auth.login')
    router.post('/login', handleUserLogin)
    router.post('/identify-account', handleAccountIdentification)
    router.get('/challenge', renderAuthChallenge).as('auth.challenge')
    router.get('/register', renderRegistrationForm).as('auth.register')
    router.post('/register', registerNewUser)
    router.post('/register/:provider', registerNewUserWithSocialProvider)
    router.get('/new-oauth-user/:providerId', renderNewOAuthUser).as('new-oauth-user')
  })
  .prefix('/auth')
  .use([middleware.guest()])
