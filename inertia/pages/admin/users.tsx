import { AdminBreadcrumb } from '../../app/components/admin/AdminBreadcrumb'
import { UsersTable } from '../../app/components/admin/UsersTable'
import DashboardLayout from '../../app/layouts/dashboard.layout'

interface AdminUsersPageProps {
  users: {
    data: Array<{
      id: string
      firstName: string
      lastName: string
      email: string
      emailVerifiedAt: Date | null
      role: string
      createdAt: Date
    }>
    pagination: {
      currentPage: number
      perPage: number
      total: number
      totalPages: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
  }
}

const AdminUsersPage = (props: AdminUsersPageProps) => {
  const { users } = props

  return (
    <div className="flex-1 py-6 px-3">
      <UsersTable users={users} />
    </div>
  )
}

AdminUsersPage.layout = (page: React.ReactNode) => {
  const adminHeader = <AdminBreadcrumb items={[{ label: 'Users' }]} />

  return (
    <DashboardLayout title="Admin - Users" header={adminHeader}>
      {page}
    </DashboardLayout>
  )
}

export default AdminUsersPage
