import { useState } from 'react'
import { Pencil, Trash2, MessageSquare, Calendar } from 'lucide-react'
import type { Task } from '../types'
import { PriorityBadge } from './PriorityBadge'
import { TaskStatusBadge } from './TaskStatusBadge'

interface Props {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export function TaskCard({ task, onEdit, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false)

  const handleDelete = () => {
    if (confirming) {
      onDelete(task.id)
      setConfirming(false)
    } else {
      setConfirming(true)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <PriorityBadge priority={task.priority} />
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(task)}
            aria-label="Editar tarea"
            className="p-1 text-gray-400 hover:text-primary-600 rounded"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            aria-label={confirming ? 'Confirmar eliminación' : 'Eliminar tarea'}
            className={`p-1 rounded ${
              confirming
                ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
                : 'text-gray-400 hover:text-red-600'
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate mb-2">
        {task.title}
      </p>
      <div className="flex items-center justify-between gap-2">
        <TaskStatusBadge status={task.status} />
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {task.due_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(task.due_date).toLocaleDateString('es-ES')}
            </span>
          )}
          {task.comment_count > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {task.comment_count}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
