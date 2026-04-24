'use client'
import SearchBox from '@/components/SearchBox'
import { ThemeToggle } from '@/components/ThemeToggler'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/auth.provider'
import React from 'react'

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth()
  return (
    <div>
      <div className='flex justify-between gap-3 w-full '>
        <h1>Dashboard</h1>
        <SearchBox className='flex-1 max-w-lg' />
        <div className=' flex gap-2 items-center'>
          <ThemeToggle />
          <Button
            variant={'secondary'}
            className='m-4 text-xs '
            onClick={() => logout()}
          >
            Hi: {user?.email.split('@')[0]}
          </Button>
        </div>
      </div>
      <main>{children}</main>
    </div>
  )
}

export default DashboardLayout
