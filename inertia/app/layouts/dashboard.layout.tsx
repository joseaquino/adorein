import { Head, Link } from '@inertiajs/react'
import { UserDropdown } from '../components/layout/UserDropdown'

interface DashboardLayoutProps {
  title: string
  header?: React.ReactNode
}

const DashboardLayout = ({ children, title, header }: React.PropsWithChildren<DashboardLayoutProps>) => {
  const gridRows = header ? 'grid-rows-[auto_auto_1fr]' : 'grid-rows-[auto_1fr]'
  
  return (
    <div className="bg-slate-100 h-screen">
      <Head title={title} />
      <div className={`w-full h-full grid ${gridRows}`}>
        <div className="bg-slate-200 border-b border-slate-300">
          <header className="flex justify-between py-2 px-3 w-full max-w-5xl mx-auto items-center">
            <Link
              href="/"
              className="text-xl font-bold text-indigo-700 uppercase font-mono tracking-wider hover:text-indigo-800 transition-colors cursor-pointer"
            >
              Adorein
            </Link>
            <UserDropdown />
          </header>
        </div>
        {header && (
          <div className="bg-white border-b border-slate-300">
            <div className="w-full max-w-5xl mx-auto">
              {header}
            </div>
          </div>
        )}
        <div className="w-full h-full max-w-5xl mx-auto">{children}</div>
      </div>
    </div>
  )
}

export default DashboardLayout
