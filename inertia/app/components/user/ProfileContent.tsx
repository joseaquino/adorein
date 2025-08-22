import { useForm } from '@inertiajs/react'
import { CheckIcon, PencilSimpleIcon, XIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import Button from '~/app/components/form/button'
import EditableField from '~/app/components/form/EditableField'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  emailVerifiedAt?: Date | null
}

interface ProfileContentProps {
  user: User
  isOwnProfile?: boolean
  updateUrl?: string
}

const ProfileContent = ({ user, isOwnProfile = false, updateUrl }: ProfileContentProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [originalEmail] = useState(user.email)

  const { data, setData, post, processing, errors, reset } = useForm({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setData(name as keyof typeof data, value)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  const handleSave = () => {
    const url = updateUrl || '/user/profile'
    post(url, {
      onSuccess: () => {
        setIsEditing(false)
      },
    })
  }

  const emailChanged = data.email !== originalEmail
  const canEdit = isOwnProfile || updateUrl

  return (
    <div className={`bg-white border-b border-slate-200 ${isEditing ? '' : 'pb-6'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Contact Information</h2>
        {!isEditing && canEdit && (
          <Button
            variant="outlined"
            size="sm"
            onClick={handleEdit}
            className="flex items-center gap-1"
          >
            <PencilSimpleIcon size={16} />
            Edit
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <EditableField
          label="First Name"
          name="firstName"
          value={data.firstName}
          isEditing={isEditing}
          onChange={handleInputChange}
          error={errors.firstName}
          alignStart={!!errors.firstName}
          autoFocus
        />

        <EditableField
          label="Last Name"
          name="lastName"
          value={data.lastName}
          isEditing={isEditing}
          onChange={handleInputChange}
          error={errors.lastName}
          alignStart={!!errors.lastName}
        />

        <EditableField
          label="Email"
          name="email"
          type="email"
          value={data.email}
          isEditing={isEditing}
          onChange={handleInputChange}
          displayClassName="text-sm text-slate-900 font-mono py-2"
          helperText={
            emailChanged && isOwnProfile
              ? 'Changing your email address will require email verification. Your email will not be updated until the new email address has been verified.'
              : undefined
          }
          error={errors.email}
          alignStart
        />
      </div>

      {isEditing && (
        <div className="flex gap-2 justify-end p-4 bg-slate-50 mt-6">
          <Button
            variant="text"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-800"
          >
            <XIcon size={16} />
            Cancel
          </Button>
          <Button
            variant="contained"
            size="sm"
            onClick={handleSave}
            disabled={processing}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700"
          >
            <CheckIcon size={16} />
            {processing ? 'Saving...' : 'Save'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default ProfileContent
