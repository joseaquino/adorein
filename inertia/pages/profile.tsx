import { usePage } from '@inertiajs/react'
import { Check, PencilSimple, X } from '@phosphor-icons/react'
import { useState } from 'react'
import Button from '~/app/components/form/button'
import EditableField from '~/app/components/form/EditableField'
import DashboardLayout from '~/app/layouts/dashboard.layout'
import UserLayout from '~/app/layouts/user.layout'

interface PersonalInformationFormData {
  firstName: string
  lastName: string
  email: string
}

const ProfilePage = () => {
  const { auth } = usePage().props

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<PersonalInformationFormData>({
    firstName: auth.user.firstName,
    lastName: auth.user.lastName,
    email: auth.user.email,
  })
  const [originalEmail] = useState(auth.user.email)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setFormData({
      firstName: auth.user.firstName,
      lastName: auth.user.lastName,
      email: auth.user.email,
    })
    setIsEditing(false)
  }

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving:', formData)
    setIsEditing(false)
  }

  const emailChanged = formData.email !== originalEmail

  return (
    <div className={`bg-white border-y border-slate-200 ${isEditing ? 'pt-6' : 'py-6'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Contact Information</h2>
        {!isEditing && (
          <Button
            variant="outlined"
            size="sm"
            onClick={handleEdit}
            className="flex items-center gap-1"
          >
            <PencilSimple size={16} />
            Edit
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <EditableField
          label="First Name"
          name="firstName"
          value={formData.firstName}
          isEditing={isEditing}
          onChange={handleInputChange}
          autoFocus
        />

        <EditableField
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          isEditing={isEditing}
          onChange={handleInputChange}
        />

        <EditableField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          isEditing={isEditing}
          onChange={handleInputChange}
          displayClassName="text-sm text-slate-900 font-mono py-2"
          helperText={
            emailChanged
              ? 'Changing your email address will require email verification. Your email will not be updated until the new email address has been verified.'
              : undefined
          }
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
            <X size={16} />
            Cancel
          </Button>
          <Button
            variant="contained"
            size="sm"
            onClick={handleSave}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700"
          >
            <Check size={16} />
            Save
          </Button>
        </div>
      )}
    </div>
  )
}

ProfilePage.layout = (page: React.ReactNode) => (
  <DashboardLayout title="Personal Information">
    <UserLayout title="Personal Information">{page}</UserLayout>
  </DashboardLayout>
)

export default ProfilePage
