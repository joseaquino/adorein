/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import {
  handleAdminUserProfile,
  handleAdminUserProfileUpdate,
  handleAdminUsers,
} from '#handlers/admin'
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
import { handleProfileUpdate } from '#handlers/profile'
import {
  registerNewUser,
  registerNewUserWithSocialProvider,
  renderRegistrationForm,
} from '#handlers/register'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router.on('/docs').renderInertia('docs')

// HOME ROUTES

router
  .on('/')
  .renderInertia('home')
  .use([middleware.auth(), middleware.emailVerification()])
  .as('home')

// USER ROUTES
router
  .group(() => {
    router.get('/profile', ({ inertia }) => inertia.render('profile')).as('user.profile')
    router.post('/profile', handleProfileUpdate).as('user.profile.update')
  })
  .prefix('/user')
  .use([middleware.auth(), middleware.emailVerification()])

// ADMIN ROUTES
router
  .group(() => {
    router.get('/', ({ inertia }) => inertia.render('admin/index')).as('admin.index')
    router.get('/users', handleAdminUsers).as('admin.users')
    router.get('/users/:id/profile', handleAdminUserProfile).as('admin.users.profile')
    router.post('/users/:id/profile', handleAdminUserProfileUpdate).as('admin.users.profile.update')
  })
  .prefix('/admin')
  .use([middleware.auth(), middleware.emailVerification(), middleware.hasRole({ role: 'ADMIN' })])

// AUTH ROUTES

router.post('/auth/logout', handleUserLogout).as('logout')

// Email verification routes (requires authenticated user, verified or not)
router
  .group(() => {
    router.get('/verify-email', renderEmailVerification).as('auth.verify-email')
    router.post('/verify-email', handleEmailVerification)
    router.post('/resend-verification', handleResendVerification)
  })
  .prefix('/auth')
  .use([middleware.auth()])

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
