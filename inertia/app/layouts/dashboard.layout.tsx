import { Head } from '@inertiajs/react'
import { UserDropdown } from '../components/layout/UserDropdown'

interface DashboardLayoutProps {
  title: string
}

const DashboardLayout = ({ children, title }: React.PropsWithChildren<DashboardLayoutProps>) => {
  return (
    <div className="bg-slate-100 h-screen">
      <Head title={title} />
      <div className="w-full grid grid-rows-[auto_1fr]">
        <div className="bg-slate-200 border-b border-slate-300">
          <header className="flex justify-between py-2 px-3 w-full max-w-5xl mx-auto items-center">
            <p className="text-xl font-bold text-indigo-700 uppercase font-mono tracking-wider">
              Adorein
            </p>
            <UserDropdown />
          </header>
        </div>
        <div className="w-full max-w-5xl mx-auto">{children}</div>
      </div>
    </div>
  )
}

export default DashboardLayout
