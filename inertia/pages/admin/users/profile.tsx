import { AdminBreadcrumb } from '../../../app/components/admin/AdminBreadcrumb'
import ProfileContent from '../../../app/components/user/ProfileContent'
import DashboardLayout from '../../../app/layouts/dashboard.layout'
import UserLayout from '../../../app/layouts/user.layout'

interface AdminUserProfilePageProps {
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

const AdminUserProfilePage = (props: AdminUserProfilePageProps) => {
  const { user } = props

  return (
    <ProfileContent
      user={user}
      isOwnProfile={false}
      updateUrl={`/admin/users/${user.id}/profile`}
    />
  )
}

AdminUserProfilePage.layout = (page: React.ReactElement<AdminUserProfilePageProps>) => {
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
    <DashboardLayout title={`Admin - ${user.firstName} ${user.lastName}`} header={adminHeader}>
      <UserLayout user={user} isAdminView={true}>
        {page}
      </UserLayout>
    </DashboardLayout>
  )
}

export default AdminUserProfilePage
