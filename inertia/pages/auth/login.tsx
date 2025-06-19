import { Link, useForm } from '@inertiajs/react'
import Button from '~/app/components/form/button'
import Input from '~/app/components/form/input'
import AuthLayout from '~/app/layouts/auth.layout'

const LoginPage = () => {
  const { data, setData, post, errors } = useForm({ email: '' })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    post('/auth/identify-account')
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

LoginPage.layout = (page: React.ReactNode) => <AuthLayout title="Login">{page}</AuthLayout>

export default LoginPage
