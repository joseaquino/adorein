import ProfileContent from '~/app/components/user/ProfileContent'
import DashboardLayout from '~/app/layouts/dashboard.layout'
import UserLayout from '~/app/layouts/user.layout'

interface ProfilePageProps {
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

const ProfilePage = (props: ProfilePageProps) => {
  const { auth } = props

  return <ProfileContent user={auth.user} isOwnProfile={true} />
}

ProfilePage.layout = (page: React.ReactElement<ProfilePageProps>) => {
  const { auth } = page.props

  return (
    <DashboardLayout title="Personal Information">
      <UserLayout user={auth.user}>{page}</UserLayout>
    </DashboardLayout>
  )
}

export default ProfilePage
