import { Link, router, useForm } from '@inertiajs/react'
import { ArrowsLeftRight, GithubLogo, GoogleLogo, User } from '@phosphor-icons/react'
import { ReactNode } from 'react'
import Button from '~/app/components/form/button'
import Input from '~/app/components/form/input'
import AuthLayout from '~/app/layouts/auth.layout'

const AccountEmailForm = () => {
  const { data, setData, post, errors } = useForm({ email: '' })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    post('/auth/login')
  }

  return (
    <div className="flex flex-col gap-4">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          label="Email:"
          name="email"
          type="email"
          value={data.email}
          error={errors.email}
          onChange={(e) => setData('email', e.target.value)}
          placeholder="Enter your account's email address"
        />
        <Button type="submit" fullWidth>
          Continue
        </Button>
      </form>
      <p className="text-xs text-center text-slate-500">
        You don't have an account?{' '}
        <Link href="/auth/register" className="text-indigo-800">
          Create an account
        </Link>
      </p>
    </div>
  )
}

const OAuthProviderIcons: Record<string, ReactNode> = {
  google: <GoogleLogo size={32} />,
  github: <GithubLogo size={32} />,
}

interface AccountLoginFormProps {
  email: string
  authProviders: Array<{ name: string; url: string }>
  onEmailChange?: () => void
}

const AccountLoginForm = (props: AccountLoginFormProps) => {
  const { email, onEmailChange, authProviders } = props
  const { data, setData, post, errors } = useForm({ password: '', email })
  const socialProviders = authProviders.filter((provider) => provider.name !== 'password')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    post('/auth/login')
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="border border-slate-300 flex gap-2 items-center w-full p-2 rounded-full bg-slate-50">
        <span className="size-8 rounded-full bg-indigo-50 border border-indigo-600 flex items-center justify-center">
          <User size={24} className="text-indigo-600" />
        </span>
        <span className="flex-grow">{email}</span>
        <button
          className="size-8 flex items-center justify-center hover:bg-slate-300 rounded-full"
          onClick={onEmailChange}
        >
          <ArrowsLeftRight size={24} className="text-slate-600" />
        </button>
      </div>
      {socialProviders.length > 0 && (
        <div className="flex flex-col gap-4">
          {socialProviders.map((provider) => (
            <a
              key={provider.name}
              href={provider.url}
              className="w-full bg-slate-100 hover:shadow-md hover:bg-slate-200 border border-slate-300 rounded-md p-2 flex gap-2 items-center justify-center"
            >
              {OAuthProviderIcons[provider.name]}
              <span className="capitalize"> Login with {provider.name}</span>
            </a>
          ))}
        </div>
      )}
      {authProviders.some((provider) => provider.name === 'password') && (
        <div>
          {socialProviders.length > 0 && (
            <div className="grid grid-cols-3 gap-2 items-center my-2">
              <span className="h-px bg-slate-300"></span>
              <p className="text-center">Or Enter Your Password</p>
              <span className="h-px bg-slate-300"></span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Password:"
              name="password"
              type="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              error={errors.password}
            />
            <Button type="submit" fullWidth>
              Login
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}

interface LoginProps {
  userEmail?: string
  authProviders?: Array<{ name: string; url: string }>
}

const LoginPage = (props: LoginProps) => {
  const { authProviders, userEmail } = props

  return userEmail && authProviders ? (
    <AccountLoginForm
      email={userEmail}
      authProviders={authProviders}
      onEmailChange={() => router.get('/auth/login')}
    />
  ) : (
    <AccountEmailForm />
  )
}

LoginPage.layout = (page: React.ReactNode) => <AuthLayout title="Login">{page}</AuthLayout>

export default LoginPage
