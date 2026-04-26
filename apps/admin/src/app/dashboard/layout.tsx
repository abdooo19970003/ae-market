'use client'
import AppNavbar from '@/components/AppNavbar'
import AppSidebar from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className='flex gap-2 w-full'>
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
