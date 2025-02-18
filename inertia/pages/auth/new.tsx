import { useForm } from '@inertiajs/react'
import { Confetti } from '@phosphor-icons/react'
import Button from '~/app/components/form/button'
import Input from '~/app/components/form/input'
import AuthLayout from '~/app/layouts/auth.layout'

interface NewAccountPageProps {
  providerId: string
  provider: string
  email: string
  firstName: string
  lastName: string
}

const NewAccountPage = (props: NewAccountPageProps) => {
  const { provider, email, firstName, lastName, providerId } = props
  const { data, setData, post, errors } = useForm({ firstName, lastName, email })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    post(`/auth/new-oauth-user/${providerId}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="bg-green-100 p-2 border border-green-600 text-green-800 rounded flex gap-4 items-center">
        <Confetti size={32} />
        Your new account was successfully created
      </p>
      <p>
        Please verify the information provided from your connected{' '}
        <span className="capitalize">{provider}</span> account.
      </p>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name:"
            name="firstName"
            value={data.firstName}
            onChange={(e) => setData('firstName', e.target.value)}
            error={errors.firstName}
          />
          <Input
            label="Last Name:"
            name="lastName"
            value={data.lastName}
            onChange={(e) => setData('lastName', e.target.value)}
            error={errors.lastName}
          />
        </div>
        <Input
          label="Email:"
          name="email"
          value={data.email}
          onChange={(e) => setData('email', e.target.value)}
          error={errors.email}
        />
        <Button type="submit" fullWidth>
          Continue
        </Button>
      </form>
    </div>
  )
}

NewAccountPage.layout = (page: React.ReactNode) => (
  <AuthLayout title="Verify New Account">{page}</AuthLayout>
)

export default NewAccountPage
