import type { TaskStatus } from '../types'

export const STATUS_CONFIG: Record<TaskStatus, { label: string; classes: string }> = {
  todo: {
    label: 'Por hacer',
    classes: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  },
  in_progress: {
    label: 'En progreso',
    classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  in_review: {
    label: 'En revisión',
    classes: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  },
  done: {
    label: 'Hecho',
    classes: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
}

interface Props {
  status: TaskStatus
}

export function TaskStatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.classes}`}
    >
      {config.label}
    </span>
  )
}
