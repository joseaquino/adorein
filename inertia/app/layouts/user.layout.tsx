import { Link } from '@inertiajs/react'
import { UserIcon } from '@phosphor-icons/react'

interface UserLayoutProps {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    role?: string
  }
  isAdminView?: boolean
}

const UserLayout = ({
  children,
  user,
  isAdminView = false,
}: React.PropsWithChildren<UserLayoutProps>) => {
  return (
    <div className="flex flex-col gap-4 h-full py-4">
      {/* User Profile Section */}
      <div className="row-span-1 flex bg-white rounded-lg border border-slate-200 py-4">
        <div className="size-20 bg-indigo-50 border-2 border-indigo-600 rounded-md flex items-center justify-center mx-4">
          {isAdminView ? (
            <div className="text-indigo-600 text-2xl font-bold">
              {user.firstName.charAt(0)}
              {user.lastName.charAt(0)}
            </div>
          ) : (
            <UserIcon size={40} className="text-indigo-600" />
          )}
        </div>
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-slate-900">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-sm text-slate-600 font-mono">{user.email}</p>
          {isAdminView && user.role && (
            <div className="mt-2">
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.role === 'ADMIN'
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {user.role}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex grow bg-white rounded-lg shadow-sm border border-slate-200">
        {/* Left Sidebar */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 rounded-l-lg">
          {/* Navigation */}
          <nav className="space-y-2">
            {isAdminView ? (
              <div className="flex items-center px-4 py-3 gap-3 text-sm font-medium text-indigo-600 bg-indigo-100 border-r-4">
                <UserIcon size={24} />
                Profile Information
              </div>
            ) : (
              <Link
                href="/user/profile"
                className="flex items-center px-4 py-3 gap-3 text-sm font-medium text-indigo-600 bg-indigo-100 border-r-4 hover:bg-indigo-200 transition-colors cursor-pointer"
              >
                <UserIcon size={24} />
                Personal Information
              </Link>
            )}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">{children}</div>
      </div>
    </div>
  )
}

export default UserLayout
