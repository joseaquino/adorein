import { Head } from '@inertiajs/react'

interface AuthLayoutProps {
  title: string
}

const AuthLayout = ({ children, title }: React.PropsWithChildren<AuthLayoutProps>) => {
  return (
    <div className="bg-primary-1 h-screen grid items-center">
      <Head title={title} />
      <div className="max-w-md w-full m-auto flex flex-col gap-6">
        <h1 className="text-2xl font-bold border-b pb-4 border-slate-300">{title}</h1>
        {children}
      </div>
    </div>
  )
}

export default AuthLayout
