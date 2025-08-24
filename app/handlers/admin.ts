import { db } from '#database/db'
import { users } from '#database/schema/users'
import type { HttpContext } from '@adonisjs/core/http'
import { count, desc, eq } from 'drizzle-orm'

export const handleAdminUsers = async ({ inertia, request }: HttpContext) => {
  const page = Number(request.input('page', 1))
  const perPage = 15
  const offset = (page - 1) * perPage

  // Get total count
  const totalResult = await db.select({ count: count() }).from(users)
  const total = totalResult[0].count

  // Get paginated users
  const allUsers = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      emailVerifiedAt: users.emailVerifiedAt,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(perPage)
    .offset(offset)

  const totalPages = Math.ceil(total / perPage)

  return inertia.render('admin/users', {
    users: {
      data: allUsers,
      pagination: {
        currentPage: page,
        perPage,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  })
}

export const handleAdminUserProfile = async ({ inertia, params, response }: HttpContext) => {
  const userId = params.id

  if (!userId) {
    return response.badRequest('A User ID is required')
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })

  if (!user) {
    return response.notFound('User not found')
  }

  return inertia.render('admin/users/profile', {
    user: user,
  })
}

export const handleAdminUserActivityMonitor = async ({
  inertia,
  params,
  response,
}: HttpContext) => {
  const userId = params.id

  if (!userId) {
    return response.badRequest('A User ID is required')
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })

  if (!user) {
    return response.notFound('User not found')
  }

  return inertia.render('admin/users/activity-monitor', {
    user: user,
  })
}

export const handleAdminUserProfileUpdate = async ({
  request,
  response,
  params,
  session,
}: HttpContext) => {
  const userId = params.id
  const { firstName, lastName, email } = request.all()

  try {
    // Update the user
    const updatedUser = await db
      .update(users)
      .set({
        firstName,
        lastName,
        email,
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })

    if (!updatedUser.length) {
      return response.notFound('User not found')
    }

    return response.redirect().back()
  } catch (error) {
    session.flash('errors', {
      general: 'Failed to update user profile',
    })
    return response.redirect().back()
  }
}
