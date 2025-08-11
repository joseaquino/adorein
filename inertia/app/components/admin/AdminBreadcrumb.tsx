import { router } from '@inertiajs/react'
import { CaretRightIcon, HouseIcon, ListBulletsIcon, UsersThreeIcon } from '@phosphor-icons/react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface AdminBreadcrumbProps {
  items: BreadcrumbItem[]
}

export const AdminBreadcrumb = ({ items }: AdminBreadcrumbProps) => {
  const handleHomeClick = () => {
    router.get('/admin')
  }

  const handleUsersClick = () => {
    router.get('/admin/users')
  }

  return (
    <div className="py-2 px-4">
      <nav className="flex items-center text-sm text-slate-600">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="flex items-center gap-1 px-2 py-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors">
            <ListBulletsIcon size={14} />
            Menu
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={4}
              align="start"
              className="min-w-48 bg-white shadow-lg rounded-md border border-slate-300"
            >
              <DropdownMenu.Item
                className="p-3 flex gap-2 items-center text-sm cursor-pointer hover:bg-slate-50"
                onSelect={handleHomeClick}
              >
                <HouseIcon size={16} />
                Admin
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-px bg-slate-300" />
              <DropdownMenu.Item
                className="p-3 flex gap-2 items-center text-sm cursor-pointer hover:bg-slate-50"
                onSelect={handleUsersClick}
              >
                <UsersThreeIcon size={16} />
                Users
              </DropdownMenu.Item>
              <DropdownMenu.Arrow className="fill-white w-4 h-2" />
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            <CaretRightIcon size={14} className="mx-2 text-slate-400" />
            {item.href ? (
              <button
                onClick={() => router.get(item.href!)}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <span className="text-slate-800 font-medium px-2 py-1">{item.label}</span>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}
