import { useState } from 'react'
import { User, Shield, Monitor, Bell, Database } from 'lucide-react'
import ProfileTab from './components/ProfileTab'
import SecurityTab from './components/SecurityTab'
import InterfaceTab from './components/InterfaceTab'
import NotificationsTab from './components/NotificationsTab'
import DataTab from './components/DataTab'

type TabId = 'profile' | 'security' | 'interface' | 'notifications' | 'data'

interface TabItem {
  id: TabId
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const TABS: TabItem[] = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'security', label: 'Seguridad', icon: Shield },
  { id: 'interface', label: 'Interfaz', icon: Monitor },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'data', label: 'Datos', icon: Database },
]

function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configuración</h1>

      <div className="flex gap-6">
        {/* Vertical tab nav */}
        <nav className="min-w-[200px] space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-l-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {tab.label}
              </button>
            )
          })}
        </nav>

        {/* Content area */}
        <div className="flex-1 min-w-0 rounded-lg border border-gray-200 bg-white p-6">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'interface' && <InterfaceTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'data' && <DataTab />}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
