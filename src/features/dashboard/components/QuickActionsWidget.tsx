import { useNavigate } from 'react-router-dom'
import { Plus, FileText, FolderPlus } from 'lucide-react'

const ACTIONS = [
  { label: 'Nueva Tarea', icon: Plus, path: '/tasks?new=true' },
  { label: 'Nueva Nota', icon: FileText, path: '/notes?new=true' },
  { label: 'Nuevo Proyecto', icon: FolderPlus, path: '/projects?new=true' },
]

export function QuickActionsWidget() {
  const navigate = useNavigate()

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Acciones Rápidas
      </h2>
      <div className="flex flex-wrap gap-3">
        {ACTIONS.map(({ label, icon: Icon, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
