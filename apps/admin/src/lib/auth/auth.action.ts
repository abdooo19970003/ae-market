"use server"
import { cookies } from 'next/headers'
import {
  AUTH_COOKIES,
  AUTH_ENDPOINTS,
  AuthResponse,
  AuthUser,
} from './auth.types'

// ====================================
// Cookies Manegment - server-side only
// ====================================
const setAuthCookies = async (tokens: {
  accessToken: string
  refreshToken: string
}) => {
  const cookiesStore = await cookies()

  // AccessToken: short-lived , httpOnly
  cookiesStore.set(AUTH_COOKIES.ACCESS_TOKEN, tokens.accessToken, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60, // 1 hour
  })

  // RefreshToken: long-lived, httpOnly
  cookiesStore.set(AUTH_COOKIES.REFRESH_TOKEN, tokens.refreshToken, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

const clearAuthCookies = async () => {
  const cookiesStore = await cookies()
  cookiesStore.delete(AUTH_COOKIES.ACCESS_TOKEN)
  cookiesStore.delete(AUTH_COOKIES.REFRESH_TOKEN)
}

const getAccessToken = async (): Promise<string | null> => {
  const cookiesStore = await cookies()
  return cookiesStore.get(AUTH_COOKIES.ACCESS_TOKEN)?.value ?? null
}

const getRefreshToken = async (): Promise<string | null> => {
  const cookiesStore = await cookies()
  return cookiesStore.get(AUTH_COOKIES.REFRESH_TOKEN)?.value ?? null
}

// ====================================
// Auth Server Actions
// ====================================

export const registerAction = async (email: string, password: string): Promise<{ success: boolean; user: AuthUser | null; error?: string }> => {
  try {
    const res = await fetch(`${AUTH_ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Registration failed')
    }

    const apiResponse = await res.json()
    const data: AuthResponse = apiResponse.data

    // Set Cookies - server-side
    await setAuthCookies({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    })

    return {
      success: true,
      user: data.user,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Registration failed',
      user: null,
    }
  }
}

export const loginAction = async (email: string, password: string): Promise<{ success: boolean; user: AuthUser | null; error?: string }> => {

  try {
    const res = await fetch(`${AUTH_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Login failed')
    }

    const apiResponse = await res.json()
    const data: AuthResponse = apiResponse.data



    // Set Cookies - server-side
    await setAuthCookies({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    })

    return {
      success: true,
      user: data.user,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Login failed',
      user: null,
    }
  }
}

export const logoutAction = async () => {
  try {
    const accessToken = await getAccessToken()
    if (accessToken) {
      await fetch(`${AUTH_ENDPOINTS.LOGOUT}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }).catch(() => null)
    }
    // Clear Client Auth-Cookies
    await clearAuthCookies()
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Logout failed',
    }
  }
}

export const refreshTokenAction = async (): Promise<AuthUser | null> => {
  try {
    const refreshToken = await getRefreshToken()
    if (!refreshToken) return null

    const res = await fetch(`${AUTH_ENDPOINTS.REFRESH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) {
      await clearAuthCookies()
      return null
    }
    const apiResponse = await res.json()
    const data: AuthResponse = apiResponse.data

    // Set Cookies - server-side
    await setAuthCookies({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    })
  } catch (err) {
    await clearAuthCookies()
    return null
  }

  return null
}

export const getCurrentUserAction = async (): Promise<AuthUser | null> => {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) return null
    const res = await fetch(`${AUTH_ENDPOINTS.ME}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    })
    if (!res.ok) {
      // token expired
      // try refresh it
      const user = await refreshTokenAction()
      return user
    }
    const data = await res.json()
    return data.data ?? null
  } catch (err) {
    return null
  }
}
