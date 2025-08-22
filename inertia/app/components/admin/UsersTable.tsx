import { router, Link } from '@inertiajs/react'
import { CheckIcon, PencilSimpleIcon, XIcon } from '@phosphor-icons/react'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  emailVerifiedAt: Date | null
  role: string
  createdAt: Date
}

interface Pagination {
  currentPage: number
  perPage: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface UsersTableProps {
  users: {
    data: User[]
    pagination: Pagination
  }
}

export const UsersTable = ({ users }: UsersTableProps) => {
  const { data, pagination } = users

  const handlePageChange = (page: number) => {
    router.get('/admin/users', { page }, { preserveState: true })
  }


  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date))
  }

  return (
    <div className="bg-white rounded-lg border border-slate-300 overflow-hidden">
      {/* Table Header */}
      <div className="border-b border-slate-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-slate-800">Users</h3>
        <p className="text-sm text-slate-600 mt-1">
          Showing {data.length} of {pagination.total} users
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                Verified
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">
                    {user.firstName} {user.lastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-600 font-mono">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex justify-center">
                    {user.emailVerifiedAt ? (
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckIcon size={14} className="text-green-600" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                        <XIcon size={14} className="text-slate-500" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'ADMIN'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Link
                    href={`/admin/users/${user.id}/profile`}
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-colors"
                  >
                    <PencilSimpleIcon size={16} />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className={`px-3 py-1 text-sm rounded border ${
                pagination.hasPrevPage
                  ? 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  : 'border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className={`px-3 py-1 text-sm rounded border ${
                pagination.hasNextPage
                  ? 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  : 'border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
