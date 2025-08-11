import DashboardLayout from '../../app/layouts/dashboard.layout'
import { AdminBreadcrumb } from '../../app/components/admin/AdminBreadcrumb'

const AdminUsersPage = () => {
  return (
    <div className="flex-1 py-6 px-3">
      <div className="bg-white rounded-lg border border-slate-300 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Users Management</h2>
        <p className="text-slate-600">
          This is the users management page. You can see the breadcrumb shows: Menu → Users
        </p>
      </div>
    </div>
  )
}

AdminUsersPage.layout = (page: React.ReactNode) => {
  const adminHeader = (
    <AdminBreadcrumb 
      items={[
        { label: 'Users' }
      ]} 
    />
  )

  return (
    <DashboardLayout title="Admin - Users" header={adminHeader}>
      {page}
    </DashboardLayout>
  )
}

export default AdminUsersPage