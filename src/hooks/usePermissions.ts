import { useAuthStore } from '@/store/authStore'

const ROLE_COLORS: Record<string, string> = {
  Owner: '#dc2626',
  Manager: '#d97706',
  Admin: '#7c3aed',
  Member: '#2563eb',
  Viewer: '#6b7280',
}

export interface UsePermissionsReturn {
  hasPermission: (perm: string) => boolean
  hasRole: (role: string) => boolean
  isOwner: boolean
  isAdmin: boolean
  getPrimaryRole: () => string
  getRoleColor: (role: string) => string
  tenant: ReturnType<typeof useAuthStore.getState>['tenant']
}

export function usePermissions(): UsePermissionsReturn {
  const user = useAuthStore((s) => s.user)
  const tenant = useAuthStore((s) => s.tenant)

  const hasPermission = (perm: string): boolean => user?.permissions?.includes(perm) ?? false
  const hasRole = (role: string): boolean => user?.roles?.includes(role) ?? false

  const isOwner = hasRole('Owner')
  const isAdmin = hasRole('Owner') || hasRole('Admin') || hasRole('Manager')

  const getPrimaryRole = (): string => user?.roles?.[0] ?? 'guest'
  const getRoleColor = (role: string): string => ROLE_COLORS[role] ?? '#6b7280'

  return { hasPermission, hasRole, isOwner, isAdmin, getPrimaryRole, getRoleColor, tenant }
}
