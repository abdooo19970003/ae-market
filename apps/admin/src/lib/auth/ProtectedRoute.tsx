'use client'
import React, { useEffect } from 'react'
import { useAuth } from './auth.provider'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'customer'
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (requiredRole && user?.role !== requiredRole) {
      router.push('/')
      return
    }
  }, [requiredRole, isAuthenticated, user, isLoading, router])

  if (isLoading)
    return (
      <div className='flex items-center justify-center h-screen'>
        <Spinner /> Loading...
      </div>
    )
  if (!isAuthenticated) return null

  return <>{children}</>
}

export default ProtectedRoute
