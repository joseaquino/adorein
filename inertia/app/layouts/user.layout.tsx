import { Link, usePage } from '@inertiajs/react'
import { User } from '@phosphor-icons/react'

interface UserLayoutProps {
  title: string
}

const UserLayout = ({ children, title }: React.PropsWithChildren<UserLayoutProps>) => {
  const { auth } = usePage().props

  return (
    <div className="grid h-full py-4">
      <div className="flex bg-white rounded-lg shadow-sm border border-slate-200">
        {/* Left Sidebar */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 rounded-l-lg py-6">
          {/* User Profile Section */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="size-20 bg-indigo-50 border-2 border-indigo-600 rounded-full flex items-center justify-center mb-4">
              <User size={40} className="text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              {auth.user.firstName} {auth.user.lastName}
            </h2>
            <p className="text-sm text-slate-600 font-mono">{auth.user.email}</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <Link
              href="/user/profile"
              className="flex items-center px-4 py-3 gap-3 text-sm font-medium text-indigo-600 bg-indigo-100 border-r-4 hover:bg-indigo-200 transition-colors cursor-pointer"
            >
              <User size={24} />
              Personal Information
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  )
}

export default UserLayout
