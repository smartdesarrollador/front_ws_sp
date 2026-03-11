import { useState } from 'react'
import { CheckSquare, Pencil, Trash2 } from 'lucide-react'
import type { Task } from '../types'
import { PriorityBadge } from './PriorityBadge'
import { TaskStatusBadge } from './TaskStatusBadge'

interface Props {
  tasks: Task[]
  isLoading: boolean
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

const HEADERS = ['Título', 'Prioridad', 'Estado', 'Fecha límite', 'Comentarios', 'Acciones']

function TaskRow({
  task,
  onEdit,
  onDelete,
}: {
  task: Task
  onEdit: (t: Task) => void
  onDelete: (id: string) => void
}) {
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
    <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">
        {task.title}
      </td>
      <td className="py-3 px-4">
        <PriorityBadge priority={task.priority} />
      </td>
      <td className="py-3 px-4">
        <TaskStatusBadge status={task.status} />
      </td>
      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
        {task.due_date ? new Date(task.due_date).toLocaleDateString('es-ES') : '—'}
      </td>
      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{task.comment_count}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
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
      </td>
    </tr>
  )
}

export function TaskListView({ tasks, isLoading, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" aria-label="Tareas">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
            {HEADERS.map((h) => (
              <th key={h} className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr
                  key={i}
                  className="animate-pulse border-b border-gray-100 dark:border-gray-700"
                >
                  {HEADERS.map((h) => (
                    <td key={h} className="py-3 px-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            : tasks.map((task) => (
                <TaskRow key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
              ))}
        </tbody>
      </table>
      {!isLoading && tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
          <CheckSquare className="w-12 h-12 mb-3" />
          <p className="text-sm">No hay tareas</p>
        </div>
      )}
    </div>
  )
}
