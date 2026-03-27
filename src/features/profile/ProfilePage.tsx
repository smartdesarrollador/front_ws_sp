import { useNavigate } from 'react-router-dom'
import { Settings, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const fullName = user
    ? (`${(user as { first_name?: string }).first_name ?? ''} ${(user as { last_name?: string }).last_name ?? ''}`.trim() || (user as { name?: string }).name || user.email)
    : '—'

  const initials = fullName !== '—'
    ? fullName.split(' ').map((w) => w.charAt(0)).slice(0, 2).join('').toUpperCase()
    : '??'

  const formattedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—'

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil</h1>

      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-6">
        {/* Avatar + name */}
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-primary-700">{initials}</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{fullName}</h2>
            <p className="text-sm text-gray-500">{user?.email ?? '—'}</p>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Roles</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {user?.roles && user.roles.length > 0 ? (
                user.roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700"
                  >
                    {role}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">Sin roles asignados</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Miembro desde</p>
            <p className="mt-1 text-sm text-gray-700">{formattedDate}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Estado</p>
            <p className="mt-1">
              {user?.is_active ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  Activo
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                  Inactivo
                </span>
              )}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">MFA</p>
            <p className="mt-1">
              {user?.mfa_enabled ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  Habilitado
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                  Deshabilitado
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Avatar placeholder icon when no user */}
        {!user && (
          <div className="flex justify-center py-4">
            <User className="h-12 w-12 text-gray-300" />
          </div>
        )}

        {/* CTA */}
        <div className="border-t border-gray-100 pt-4">
          <button
            onClick={() => navigate('/settings')}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <Settings className="h-4 w-4" />
            Ir a Configuración
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
