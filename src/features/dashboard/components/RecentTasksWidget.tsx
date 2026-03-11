import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { RecentTask } from '../types'

interface Props {
  tasks: RecentTask[]
  isLoading: boolean
}

const PRIORITY_CLASSES: Record<RecentTask['priority'], string> = {
  alta: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  media: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  baja: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
}

const STATUS_CLASSES: Record<RecentTask['status'], string> = {
  todo: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_review: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  done: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

const STATUS_LABELS: Record<RecentTask['status'], string> = {
  todo: 'Por hacer',
  in_progress: 'En progreso',
  in_review: 'En revisión',
  done: 'Hecho',
}

function formatDueDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
}

export function RecentTasksWidget({ tasks, isLoading }: Props) {
  const navigate = useNavigate()

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tareas Recientes</h2>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse h-8 rounded bg-gray-100 dark:bg-gray-700" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">
          No hay tareas recientes
        </p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${PRIORITY_CLASSES[task.priority]}`}>
                {task.priority}
              </span>
              <span className="truncate flex-1">{task.title}</span>
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_CLASSES[task.status]}`}>
                {STATUS_LABELS[task.status]}
              </span>
              {task.due_date && (
                <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                  {formatDueDate(task.due_date)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => navigate('/tasks')}
        className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1"
      >
        Ver todas las tareas <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  )
}
