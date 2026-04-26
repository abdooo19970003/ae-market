import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from './ui/sidebar'
import { useAuth } from '@/lib/auth/auth.provider'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import Image from 'next/image'
import Link from 'next/link'
import UserAvatar from './UserAvatar'
import { AuthUser } from '@/lib/auth/auth.types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { LayoutDashboard } from 'lucide-react'
import { FaCubes, FaSignOutAlt, FaUserFriends } from 'react-icons/fa'
import { FaGear, FaImagePortrait } from 'react-icons/fa6'
import { ImPriceTags } from 'react-icons/im'
import { BsFillPlusSquareFill } from 'react-icons/bs'

const AppSidebar = () => {
  const { open } = useSidebar()
  const { logout, user } = useAuth()
  return (
    <Sidebar
      collapsible='offcanvas'
      className='ps-2'
      variant='floating'
    >
      <SidebarHeader>
        <Link href='/dashboard'>
          <h1 className='text-xl text-center my-8 tracking-widest text-shadow-2xs text-shadow-secondary'>
            <span className='text-primary me-2 text-2xl font-bold'>AE</span>{' '}
            <span className={cn(open ? 'inline' : 'hidden')}>Market</span>
          </h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {/* Dashboard */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href='/dashboard'>
                <LayoutDashboard scale={1.2} />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {/* Categories Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href='/dashboard/categories'>
                    <FaCubes />

                    <span>All Categories</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href='/dashboard/categories/new'>
                    <BsFillPlusSquareFill />
                    <span>New Category</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Products Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Products</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href='/dashboard/products'>
                    <ImPriceTags />
                    <span>All Products</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href='/dashboard/products/new'>
                    <BsFillPlusSquareFill />
                    <span>New Product</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Admin Only Groups */}
        {user?.role === 'admin' && (
          <>
            {/* Users Group */}
            <SidebarGroup>
              <SidebarGroupLabel>Users</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href='/dashboard/users'>
                        <FaUserFriends />
                        <span>All Users</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <UserAvatar user={user} />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link
                    href='/profile'
                    className='flex items-center gap-2'
                  >
                    {' '}
                    <FaImagePortrait />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link
                    href='/settings'
                    className='flex items-center gap-2'
                  >
                    <FaGear />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className='flex items-center gap-2'
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
