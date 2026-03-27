import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useCreateTask } from '../hooks/useCreateTask'
import { useUpdateTask } from '../hooks/useUpdateTask'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import type { Task } from '../types'

const schema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200, 'Máximo 200 caracteres'),
  description: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low'] as const),
  status: z.enum(['todo', 'in_progress', 'review', 'done'] as const),
  due_date: z.string().optional().nullable(),
})

type FormData = z.infer<typeof schema>

interface Props {
  task?: Task | null
  open: boolean
  onClose: () => void
}

export function TaskModal({ task, open, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, open)
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      due_date: null,
    },
  })

  useEffect(() => {
    if (open) {
      reset(
        task
          ? {
              title: task.title,
              description: task.description ?? '',
              priority: task.priority,
              status: task.status,
              due_date: task.due_date ?? null,
            }
          : {
              title: '',
              description: '',
              priority: 'medium',
              status: 'todo',
              due_date: null,
            },
      )
    }
  }, [open, task, reset])

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      due_date: data.due_date || null,
    }
    if (task) {
      updateTask.mutate({ id: task.id, ...payload }, { onSuccess: onClose })
    } else {
      createTask.mutate(
        payload as Parameters<typeof createTask.mutate>[0],
        { onSuccess: onClose },
      )
    }
  }

  const isPending = createTask.isPending || updateTask.isPending
  const error = createTask.error || updateTask.error

  const getErrorMessage = () => {
    if (!error) return null
    if ((error as { response?: { status?: number } }).response?.status === 402) {
      return 'Has alcanzado el límite de tareas de tu plan'
    }
    return 'Ocurrió un error. Intenta de nuevo.'
  }

  const errorMessage = getErrorMessage()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="task-modal-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            {task ? 'Editar tarea' : 'Nueva tarea'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {errorMessage && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg p-3 text-sm">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título *
            </label>
            <input
              {...register('title')}
              placeholder="Título de la tarea"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.title && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Descripción opcional..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prioridad
              </label>
              <select
                {...register('priority')}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado
              </label>
              <select
                {...register('status')}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="todo">Por hacer</option>
                <option value="in_progress">En progreso</option>
                <option value="review">En revisión</option>
                <option value="done">Hecho</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha límite
            </label>
            <input
              type="date"
              {...register('due_date')}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPending && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {task ? 'Guardar cambios' : 'Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
