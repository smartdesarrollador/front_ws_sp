import { CheckSquare, FolderOpen, FileText, CalendarDays } from 'lucide-react'
import type { DashboardSummary } from '../types'

interface Props {
  summary: DashboardSummary | undefined
  isLoading: boolean
}

const CARDS = [
  {
    key: 'active_tasks' as const,
    label: 'Tareas Activas',
    icon: CheckSquare,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    key: 'total_projects' as const,
    label: 'Proyectos',
    icon: FolderOpen,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    key: 'total_notes' as const,
    label: 'Notas',
    icon: FileText,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
  {
    key: 'events_today' as const,
    label: 'Eventos Hoy',
    icon: CalendarDays,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
  },
]

export function SummaryCards({ summary, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse h-28 rounded-xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map(({ key, label, icon: Icon, color, bg }) => (
        <div
          key={key}
          className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className={`p-3 rounded-lg ${bg}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {summary?.[key] ?? 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
