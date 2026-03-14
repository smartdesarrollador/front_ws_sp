import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { publicClient } from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import type { User, Tenant } from '@/types/auth'

interface SSOValidateResponse {
  access_token: string
  refresh_token: string
  user: User
  tenant: Tenant
}

export default function SSOCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const ssoToken = searchParams.get('sso_token')
    if (!ssoToken) {
      navigate('/login', { replace: true })
      return
    }

    const validate = async () => {
      try {
        const { data } = await publicClient.post<SSOValidateResponse>(
          '/auth/sso/validate/',
          { sso_token: ssoToken },
        )
        useAuthStore.getState().setUser(data.user)
        useAuthStore.getState().setTenant(data.tenant)
        useAuthStore.getState().setAccessToken(data.access_token)
        localStorage.setItem('ws-refreshToken', data.refresh_token)
        localStorage.setItem('ws-authUser', JSON.stringify(data.user))
        localStorage.setItem('ws-authTenant', JSON.stringify(data.tenant))
        navigate('/', { replace: true })
      } catch {
        navigate('/login', { replace: true })
      }
    }

    void validate()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      <p className="text-gray-600 dark:text-gray-400">Iniciando sesión...</p>
    </div>
  )
}
