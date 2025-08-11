import DashboardLayout from '../../app/layouts/dashboard.layout'
import { AdminBreadcrumb } from '../../app/components/admin/AdminBreadcrumb'

const AdminPage = () => {
  return (
    <div className="flex-1 py-6 px-3">
      <div className="bg-white rounded-lg border border-slate-300 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Welcome to Admin Panel</h2>
        <p className="text-slate-600">Use the menu above to navigate through admin features.</p>
      </div>
    </div>
  )
}

AdminPage.layout = (page: React.ReactNode) => {
  const adminHeader = <AdminBreadcrumb items={[]} />

  return (
    <DashboardLayout title="Admin" header={adminHeader}>
      {page}
    </DashboardLayout>
  )
}

export default AdminPage
