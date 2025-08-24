import { AdminBreadcrumb } from '../../../app/components/admin/AdminBreadcrumb'
import DashboardLayout from '../../../app/layouts/dashboard.layout'
import UserLayout from '../../../app/layouts/user.layout'

interface AdminUserActivityMonitorPageProps {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    emailVerifiedAt: Date | null
    role: string
    createdAt: Date
  }
}

const AdminUserActivityMonitorPage = (props: AdminUserActivityMonitorPageProps) => {
  const { user } = props

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Activity Monitor</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Track {user.firstName} {user.lastName}'s account activity and usage patterns.
        </p>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <p className="text-gray-500">Activity monitoring features coming soon...</p>
        </div>
      </div>
    </div>
  )
}

AdminUserActivityMonitorPage.layout = (page: React.ReactElement<AdminUserActivityMonitorPageProps>) => {
  const { user } = page.props
  const adminHeader = (
    <AdminBreadcrumb
      items={[
        { label: 'Users', href: '/admin/users' },
        { label: `${user.firstName} ${user.lastName}` },
      ]}
    />
  )

  return (
    <DashboardLayout title={`Admin - ${user.firstName} ${user.lastName} - Activity Monitor`} header={adminHeader}>
      <UserLayout user={user} isAdminView={true}>
        {page}
      </UserLayout>
    </DashboardLayout>
  )
}

export default AdminUserActivityMonitorPage