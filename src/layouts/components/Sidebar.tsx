import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home,
  CheckSquare,
  Calendar,
  FileText,
  Users,
  Bookmark,
  Folder,
  Terminal,
  Key,
  Shield,
  Code2,
  ClipboardList,
  Share2,
  Activity,
  BarChart2,
  User,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { useUiStore } from '@/store/uiStore'
import { usePermissions } from '@/hooks/usePermissions'
import { useFeatureGate } from '@/hooks/useFeatureGate'

interface MenuItem {
  label: string
  to: string
  icon: LucideIcon
  permission: string | null
  feature: string | null
}

interface MenuGroup {
  group: string
  items: MenuItem[]
}

const MENU_GROUPS: MenuGroup[] = [
  {
    group: 'GENERAL',
    items: [
      { label: 'Dashboard', to: '/', icon: Home, permission: null, feature: null },
    ],
  },
  {
    group: 'PRODUCTIVIDAD',
    items: [
      { label: 'Tareas', to: '/tasks', icon: CheckSquare, permission: null, feature: null },
      { label: 'Calendario', to: '/calendar', icon: Calendar, permission: null, feature: null },
      { label: 'Notas', to: '/notes', icon: FileText, permission: null, feature: null },
      { label: 'Contactos', to: '/contacts', icon: Users, permission: null, feature: null },
      { label: 'Bookmarks', to: '/bookmarks', icon: Bookmark, permission: null, feature: null },
    ],
  },
  {
    group: 'DEVOPS',
    items: [
      { label: 'Proyectos', to: '/projects', icon: Folder, permission: null, feature: null },
      { label: 'Variables de Entorno', to: '/env-vars', icon: Terminal, permission: null, feature: 'env_vars' },
      { label: 'SSH Keys', to: '/ssh-keys', icon: Key, permission: null, feature: 'ssh_keys' },
      { label: 'SSL Certs', to: '/ssl-certs', icon: Shield, permission: null, feature: 'ssl_certs' },
      { label: 'Snippets', to: '/snippets', icon: Code2, permission: null, feature: null },
    ],
  },
  {
    group: 'ADMIN',
    items: [
      { label: 'Formularios', to: '/forms', icon: ClipboardList, permission: null, feature: 'forms' },
      { label: 'Compartido', to: '/shared', icon: Share2, permission: null, feature: null },
      { label: 'Log de Auditoría', to: '/audit', icon: Activity, permission: 'audit.view_auditlog', feature: null },
      { label: 'Reportes', to: '/reports', icon: BarChart2, permission: null, feature: 'analytics' },
    ],
  },
  {
    group: 'CUENTA',
    items: [
      { label: 'Perfil', to: '/profile', icon: User, permission: null, feature: null },
      { label: 'Configuración', to: '/settings', icon: Settings, permission: null, feature: null },
    ],
  },
]

function Sidebar() {
  const navigate = useNavigate()
  const { sidebarOpen } = useUiStore()
  const { hasPermission } = usePermissions()
  const { hasFeature, plan } = useFeatureGate()

  const canUpgradePlan = plan === 'free' || plan === 'starter'

  const visibleGroups = MENU_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        (item.permission === null || hasPermission(item.permission)) &&
        (item.feature === null || hasFeature(item.feature)),
    ),
  })).filter((group) => group.items.length > 0)

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-20 overflow-y-auto transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      <nav className="p-4 space-y-6">
        {visibleGroups.map((group) => (
          <div key={group.group}>
            <p className="px-4 mb-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span>{item.label}</span>
                        {isActive && (
                          <div className="ml-auto w-1.5 h-1.5 bg-primary-600 dark:bg-primary-400 rounded-full" />
                        )}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Upgrade CTA */}
      {canUpgradePlan && (
        <div className="p-4 mx-2 mb-4 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white">
          <p className="text-xs font-semibold mb-1">Mejora tu plan</p>
          <p className="text-xs opacity-90 mb-3">Desbloquea más funcionalidades</p>
          <button
            onClick={() => navigate('/subscription')}
            className="w-full text-xs bg-white text-primary-700 font-semibold py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
          >
            Ver planes
          </button>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
