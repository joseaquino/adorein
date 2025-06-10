import DashboardLayout from '~/app/layouts/dashboard.layout'

const HomePage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome to Inertia.js</h1>
    </div>
  )
}

HomePage.layout = (page: React.ReactNode) => (
  <DashboardLayout title="Dashboard">{page}</DashboardLayout>
)

export default HomePage
