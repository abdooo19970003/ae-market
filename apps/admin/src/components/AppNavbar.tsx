import { useAuth } from '@/lib/auth/auth.provider'
import SearchBox from './SearchBox'
import { ThemeToggle } from './ThemeToggler'
import { Button } from './ui/button'
import Link from 'next/link'
import { SidebarTrigger } from './ui/sidebar'
import UserAvatar from './UserAvatar'
import { Card } from './ui/card'

const AppNavbar = () => {
  const { user, logout } = useAuth()

  return (
    <div className='flex items-center justify-between gap-3 w-full bg-sidebar py-2 text-sidebar-foreground'>
      <SidebarTrigger size={'lg'} />
      <div className=' flex gap-2 items-center'>
        <SearchBox className='flex-1 max-w-lg' />
        <ThemeToggle />
        {user ? (
          <div
            className='flex gap-2 items-center hover:border-primary border border-transparent rounded-full py-1 px-2 select-none cursor-pointer'
            onClick={logout}
          >
            <UserAvatar user={user} />
          </div>
        ) : (
          <Button asChild>
            <Link href='/login'>Login</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
export default AppNavbar
