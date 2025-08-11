import { db } from '#database/db'
import { users } from '#database/schema/users'
import type { HttpContext } from '@adonisjs/core/http'
import { count, desc } from 'drizzle-orm'

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
