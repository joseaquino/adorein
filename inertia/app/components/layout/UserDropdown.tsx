import { router, usePage } from '@inertiajs/react'
import { BinocularsIcon, GearIcon, PlusIcon, SignOutIcon, UserIcon } from '@phosphor-icons/react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export const UserDropdown = () => {
  const { auth } = usePage().props

  const handleLogout = () => {
    router.post('/auth/logout')
  }

  const handleProfileClick = () => {
    router.get('/user/profile')
  }

  const handleAdminClick = () => {
    router.get('/admin')
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="size-9 bg-slate-100 border-2 border-slate-300 rounded-full flex items-center justify-center">
        <UserIcon size={24} className="text-slate-600" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={1}
          align="end"
          className="min-w-56 bg-slate-100 shadow-sm rounded-sm border border-slate-300"
        >
          <DropdownMenu.Label className="flex flex-col">
            <p className="px-2 py-1 border-b border-slate-300 text-xs text-slate-500 bg-slate-200">
              Currently logged in as:
            </p>
            <div className="flex gap-2 px-2 py-3">
              <div className="size-10 bg-indigo-50 border-2 border-indigo-600 rounded-full flex items-center justify-center">
                <UserIcon size={24} className="text-indigo-600" />
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-sm text-indigo-700">
                  {auth.user.firstName} {auth.user.lastName}
                </p>
                <p className="font-mono text-xs text-indigo-900">{auth.user.email}</p>
              </div>
            </div>
          </DropdownMenu.Label>
          <DropdownMenu.Separator className="h-px bg-slate-300" />
          {auth.user.role === 'ADMIN' && (
            <DropdownMenu.Item
              className="p-2 flex gap-2 items-center text-sm cursor-pointer"
              onSelect={handleAdminClick}
            >
              <BinocularsIcon size={16} />
              Admin
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Separator className="h-px bg-slate-300" />
          <DropdownMenu.Group>
            <DropdownMenu.Item
              className="p-2 flex gap-2 items-center text-sm cursor-pointer"
              onSelect={handleProfileClick}
            >
              <UserIcon size={16} />
              Profile
            </DropdownMenu.Item>
            <DropdownMenu.Item className="p-2 flex gap-2 items-center text-sm cursor-pointer">
              <GearIcon size={16} />
              Settings
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="p-2 flex gap-2 items-center text-sm cursor-pointer"
              onSelect={handleLogout}
            >
              <SignOutIcon size={16} />
              Logout
            </DropdownMenu.Item>
          </DropdownMenu.Group>
          <DropdownMenu.Separator className="h-px bg-slate-300" />
          <DropdownMenu.Item className="p-2 flex gap-2 items-center text-sm cursor-pointer">
            <PlusIcon size={16} />
            Add Account
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-px bg-slate-300" />
          <DropdownMenu.Item className="p-2 flex gap-2 items-center text-sm text-red-700 cursor-pointer">
            <SignOutIcon size={16} />
            Logout All Accounts
          </DropdownMenu.Item>
          <DropdownMenu.Arrow className="fill-slate-300 w-4 h-2" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
