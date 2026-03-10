import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/features/auth/AuthContext'

export default function ProtectedRoute() {
  const { isLoading } = useAuth()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isLoading) {
    return (
      <div role="status" aria-label="Cargando" className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
