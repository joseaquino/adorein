import { Link, router, useForm } from '@inertiajs/react'
import { GithubLogo, GoogleLogo } from '@phosphor-icons/react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { ReactNode, useEffect, useState } from 'react'
import Button from '~/app/components/form/button'
import Input from '~/app/components/form/input'
import AuthLayout from '~/app/layouts/auth.layout'

interface Provider {
  name: string
  url: string
}

interface RegisterPageProps {
  providers: Provider[]
  existingAccount: {
    providerName?: string
    email?: string
  }
}

const OAuthProviderIcons: Record<string, ReactNode> = {
  google: <GoogleLogo size={32} />,
  github: <GithubLogo size={32} />,
}

const RegisterPage = (props: RegisterPageProps) => {
  const { providers, existingAccount } = props
  const { data, setData, post, errors } = useForm({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [existingAccountModalOpen, setExistingAccountModalOpen] = useState(
    !!existingAccount.email && !!existingAccount.providerName
  )

  useEffect(() => {
    if (existingAccount.email && existingAccount.providerName) {
      setExistingAccountModalOpen(true)
    }
  }, [existingAccount])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    post('/auth/register')
  }

  const handleOAuthProviderClick = (provider: string) => {
    router.post(`/auth/register/${provider}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        {providers.map((provider) => (
          <button
            key={provider.name}
            onClick={() => handleOAuthProviderClick(provider.name)}
            className="w-full bg-slate-100 hover:shadow-md hover:bg-slate-200 border border-slate-300 rounded-md p-2 flex gap-2 items-center justify-center"
          >
            {OAuthProviderIcons[provider.name]}
            <span className="capitalize"> Sign up with {provider.name}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 items-center my-2">
        <span className="h-[1px] bg-slate-300"></span>
        <p className="text-center">Or Sign Up With</p>
        <span className="h-[1px] bg-slate-300"></span>
      </div>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <div className="grid gap-4 grid-cols-2">
          <Input
            label="First Name:"
            name="firstName"
            value={data.firstName}
            placeholder="Enter your first name"
            onChange={(e) => setData('firstName', e.target.value)}
            error={errors.firstName}
          />
          <Input
            label="Last Name:"
            name="lastName"
            value={data.lastName}
            placeholder="Enter your last name"
            onChange={(e) => setData('lastName', e.target.value)}
            error={errors.lastName}
          />
        </div>
        <Input
          label="Email:"
          name="email"
          type="email"
          value={data.email}
          placeholder="Enter your email address"
          onChange={(e) => setData('email', e.target.value)}
          error={errors.email}
        />
        <Input
          label="Password:"
          name="password"
          type="password"
          value={data.password}
          placeholder="Enter a strong password"
          onChange={(e) => setData('password', e.target.value)}
          error={errors.password}
        />
        <Button type="submit" fullWidth className="mt-4">
          Create Account
        </Button>
      </form>
      <p className="text-xs text-center text-slate-500">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-indigo-800">
          Login
        </Link>
      </p>
      <AlertDialog.Root
        open={existingAccountModalOpen}
        onOpenChange={(open) => setExistingAccountModalOpen(open)}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black opacity-70 data-[state=open]:animate-overlayShow" />
          <AlertDialog.Content className="flex flex-col gap-4 fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-xl focus:outline-none data-[state=open]:animate-contentShow">
            <AlertDialog.Title className="text-xl font-bold capitalize text-indigo-800">
              Account already registered
            </AlertDialog.Title>
            <div className="h-px bg-slate-300"></div>
            <AlertDialog.Description className="flex flex-col gap-4">
              <p>
                An account with the email <strong>{existingAccount.email}</strong> is already
                registered.
              </p>
              <p>
                Would you like to link this account with your{' '}
                <span className="capitalize">{existingAccount.providerName}</span> account?
              </p>
            </AlertDialog.Description>
            <div className="h-px bg-slate-300"></div>
            <div className="grid grid-cols-2 gap-6 items-end">
              <button className="bg-indigo-100 p-2 rounded border border-indigo-200 text-indigo-900">
                Create New Account
              </button>
              <button className="bg-indigo-700 text-white rounded p-2 border border-indigo-900">
                Link To Existing
              </button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  )
}

RegisterPage.layout = (page: React.ReactNode) => (
  <AuthLayout title="Create Account">{page}</AuthLayout>
)

export default RegisterPage
