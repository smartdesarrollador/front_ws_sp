import type { TaskPriority } from '../types'

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; classes: string }> = {
  high: {
    label: 'Alta',
    classes: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  medium: {
    label: 'Media',
    classes: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  low: {
    label: 'Baja',
    classes: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  },
}

interface Props {
  priority: TaskPriority
}

export function PriorityBadge({ priority }: Props) {
  const config = PRIORITY_CONFIG[priority]
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.classes}`}
    >
      {config.label}
    </span>
  )
}
