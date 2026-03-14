/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { publicClient, apiClient } from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import type { LoginResponse, MFALoginResponse, RegisterRequest, User, Tenant } from '@/types/auth'

export type LoginResult = { ok: true } | { mfaRequired: true; mfaToken: string }

interface AuthContextType {
  isLoading: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const { setUser, setTenant, setAccessToken, clearAuth } = useAuthStore()

  useEffect(() => {
    const refresh = async () => {
      const refreshToken = localStorage.getItem('ws-refreshToken')
      if (!refreshToken) {
        setIsLoading(false)
        return
      }
      try {
        const { data } = await publicClient.post<LoginResponse>('/auth/refresh-token', {
          refresh_token: refreshToken,
        })
        setAccessToken(data.access_token)
        localStorage.setItem('ws-refreshToken', data.refresh_token)

        const savedUser = localStorage.getItem('ws-authUser')
        const savedTenant = localStorage.getItem('ws-authTenant')
        try {
          if (savedUser) setUser(JSON.parse(savedUser) as User)
        } catch {
          localStorage.removeItem('ws-authUser')
        }
        try {
          if (savedTenant) setTenant(JSON.parse(savedTenant) as Tenant)
        } catch {
          localStorage.removeItem('ws-authTenant')
        }

        if (data.user) setUser(data.user)
        if (data.tenant) setTenant(data.tenant)
        if (data.user) localStorage.setItem('ws-authUser', JSON.stringify(data.user))
        if (data.tenant) localStorage.setItem('ws-authTenant', JSON.stringify(data.tenant))
      } catch {
        clearAuth()
        localStorage.removeItem('ws-refreshToken')
        localStorage.removeItem('ws-authUser')
        localStorage.removeItem('ws-authTenant')
      } finally {
        setIsLoading(false)
      }
    }
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (email: string, password: string): Promise<LoginResult> => {
    const { data } = await publicClient.post<LoginResponse | MFALoginResponse>('/auth/login', {
      email,
      password,
    })
    if ('mfa_required' in data) {
      return { mfaRequired: true, mfaToken: data.mfa_token }
    }
    setAccessToken(data.access_token)
    setUser(data.user)
    setTenant(data.tenant)
    localStorage.setItem('ws-refreshToken', data.refresh_token)
    localStorage.setItem('ws-authUser', JSON.stringify(data.user))
    localStorage.setItem('ws-authTenant', JSON.stringify(data.tenant))
    return { ok: true }
  }

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      clearAuth()
      localStorage.removeItem('ws-refreshToken')
      localStorage.removeItem('ws-authUser')
      localStorage.removeItem('ws-authTenant')
    }
  }

  const register = async (data: RegisterRequest) => {
    await publicClient.post('/auth/register', data)
  }

  return (
    <AuthContext.Provider value={{ isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
