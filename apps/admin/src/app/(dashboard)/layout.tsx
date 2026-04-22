import { ThemeToggle } from '@/components/ThemeToggler'
import React from 'react'

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <ThemeToggle />
      <main>{children}</main>
    </div>
  )
}

export default DashboardLayout
