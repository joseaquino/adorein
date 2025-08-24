import DashboardLayout from '~/app/layouts/dashboard.layout'
import UserLayout from '~/app/layouts/user.layout'

interface ActivityMonitorPageProps {
  auth: {
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
}

const ActivityMonitorPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Activity Monitor</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Track your account activity and usage patterns.
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

ActivityMonitorPage.layout = (page: React.ReactElement<ActivityMonitorPageProps>) => {
  const { auth } = page.props

  return (
    <DashboardLayout title="Activity Monitor">
      <UserLayout user={auth.user}>{page}</UserLayout>
    </DashboardLayout>
  )
}

export default ActivityMonitorPage
