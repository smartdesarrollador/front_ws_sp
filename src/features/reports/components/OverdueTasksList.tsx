import { AlertTriangle } from 'lucide-react'
import type { UsageData } from '../types'
import { PRIORITY_COLORS, PRIORITY_LABELS } from './TaskPriorityChart'

interface Props {
  usage: UsageData | undefined
  isLoading: boolean
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function OverdueTasksList({ usage, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    )
  }

  const overdue = usage?.overdue ?? []

  if (overdue.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
        Sin tareas vencidas 🎉
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {overdue.map((task) => (
        <li
          key={task.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 dark:border-gray-700 px-3 py-2"
        >
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
            <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {task.title}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: PRIORITY_COLORS[task.priority] ?? '#a855f7' }}
            >
              {PRIORITY_LABELS[task.priority] ?? task.priority}
            </span>
            <span className="text-xs text-red-600 dark:text-red-400 whitespace-nowrap">
              {formatDate(task.due_date)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}
