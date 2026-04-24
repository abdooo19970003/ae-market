'use client'
import AppNavbar from '@/components/AppNavbar'
import AppSidebar from '@/components/AppSidebar'
import SearchBox from '@/components/SearchBox'
import { ThemeToggle } from '@/components/ThemeToggler'
import { Button } from '@/components/ui/button'
import { SidebarProvider } from '@/components/ui/sidebar'
import { useAuth } from '@/lib/auth/auth.provider'
import React from 'react'

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth()
  return (
    <SidebarProvider>
      <div className='flex gap-2'>
        <AppSidebar />
        <div className='w-full gap-2 flex flex-col '>
          <AppNavbar />
          <main>{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default DashboardLayout
