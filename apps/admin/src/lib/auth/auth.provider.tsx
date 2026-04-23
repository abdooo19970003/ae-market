'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { AuthContextType, AuthUser } from './auth.types'
import {
  getCurrentUserAction,
  loginAction,
  refreshTokenAction,
  registerAction,
} from './auth.action'
import { email } from 'zod'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // initialize auth state on mount
  useEffect(() => {
    const initializeAuthState = async () => {
      setIsLoading(true)
      try {
        const currentUser = await getCurrentUserAction()
        setUser(currentUser)
      } finally {
        setIsLoading(false)
      }
    }
    initializeAuthState()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await loginAction(email, password)
      if (res.success) setUser(res.user)
      else throw new Error(res.error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await registerAction(email, password)
      if (res.success) setUser(res.user)
      else throw new Error(res.error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
    } catch (err) {}
  }, [])

  const refreshAuth = useCallback(async () => {
    const currentUser = await refreshTokenAction()

    setUser(currentUser)
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    refreshAuth,
    isAuthenticated: user !== null,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
