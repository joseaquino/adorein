/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const authController = () => import('#controllers/auth_controller')

router.on('/docs').renderInertia('docs')

// HOME ROUTES

router.on('/').renderInertia('home').use([middleware.auth()]).as('home')

// AUTH ROUTES

router.post('/auth/logout', [authController, 'destroy']).as('logout').use([middleware.auth()])

router
  .get('/oauth/:provider/callback', [authController, 'oauth'])
  .as('oauth')
  .use([middleware.guest()])

router
  .post('/auth/new-oauth-user/:providerId', [authController, 'updateNewOAuthUser'])
  .as('update-new-oauth-user')

router
  .group(() => {
    router.get('/login', [authController, 'index']).as('login')
    router.post('/login', [authController, 'providers'])
    router.get('/register', [authController, 'create']).as('register')
    router.post('/register', [authController, 'store'])
    router.post('/register/:provider', [authController, 'registerWithOAuthProvider'])
    router
      .get('/new-oauth-user/:providerId', [authController, 'viewNewOAuthUser'])
      .as('new-oauth-user')
  })
  .prefix('/auth')
  .use([middleware.guest()])
