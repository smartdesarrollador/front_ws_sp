import type { Task, TaskStatus } from '../types'
import { TaskCard } from './TaskCard'
import { STATUS_CONFIG } from './TaskStatusBadge'

interface Props {
  tasks: Task[]
  isLoading: boolean
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

const COLUMNS: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'done']

export function TaskKanbanView({ tasks, isLoading, onEdit, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {COLUMNS.map((status) => {
        const columnTasks = tasks.filter((t) => t.status === status)
        const config = STATUS_CONFIG[status]
        return (
          <div key={status} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {config.label}
              </h3>
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                {isLoading ? '?' : columnTasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {isLoading
                ? Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"
                    />
                  ))
                : columnTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
                  ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
