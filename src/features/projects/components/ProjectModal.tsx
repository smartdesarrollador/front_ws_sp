import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useCreateProject } from '../hooks/useCreateProject'
import { useUpdateProject } from '../hooks/useUpdateProject'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import type { Project } from '../types'

const COLOR_PRESETS = [
  '#2563eb', // blue
  '#16a34a', // green
  '#dc2626', // red
  '#9333ea', // purple
  '#d97706', // amber
  '#0891b2', // cyan
  '#db2777', // pink
  '#65a30d', // lime
]

const schema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(200),
  description: z.string().optional(),
  status: z.enum(['active', 'planning', 'archived']),
  color: z.string(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  project?: Project | null
  onClose: () => void
}

export function ProjectModal({ project, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, true)
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      status: 'active',
      color: '#2563eb',
      start_date: '',
      end_date: '',
    },
  })

  const selectedColor = watch('color')

  useEffect(() => {
    reset(
      project
        ? {
            name: project.name,
            description: project.description ?? '',
            status: project.status,
            color: project.color,
            start_date: project.start_date ?? '',
            end_date: project.end_date ?? '',
          }
        : {
            name: '',
            description: '',
            status: 'active',
            color: '#2563eb',
            start_date: '',
            end_date: '',
          },
    )
  }, [project, reset])

  const onSubmit = (data: FormData) => {
    const payload = {
      name: data.name,
      description: data.description || undefined,
      status: data.status,
      color: data.color,
      start_date: data.start_date || undefined,
      end_date: data.end_date || undefined,
    }

    if (project) {
      updateProject.mutate({ id: project.id, ...payload }, { onSuccess: onClose })
    } else {
      createProject.mutate(payload, { onSuccess: onClose })
    }
  }

  const isPending = createProject.isPending || updateProject.isPending
  const error = createProject.error || updateProject.error

  const getErrorMessage = () => {
    if (!error) return null
    if ((error as { response?: { status?: number } }).response?.status === 402) {
      return 'Has alcanzado el límite de proyectos de tu plan'
    }
    return 'Ocurrió un error. Intenta de nuevo.'
  }

  const errorMessage = getErrorMessage()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="project-modal-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            {project ? 'Editar proyecto' : 'Nuevo proyecto'}
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

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre *
            </label>
            <input
              {...register('name')}
              placeholder="Nombre del proyecto"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.name && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
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

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado
            </label>
            <select
              {...register('status')}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="active">Activo</option>
              <option value="planning">Planificación</option>
              <option value="archived">Archivado</option>
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Color ${color}`}
                  onClick={() => setValue('color', color)}
                  className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                    selectedColor === color ? 'ring-2 ring-offset-2 ring-primary-500' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input
                type="color"
                {...register('color')}
                aria-label="Color personalizado"
                className="w-7 h-7 rounded cursor-pointer border border-gray-300 dark:border-gray-600 p-0"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha inicio
              </label>
              <input
                type="date"
                {...register('start_date')}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha fin
              </label>
              <input
                type="date"
                {...register('end_date')}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Actions */}
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
              {project ? 'Guardar cambios' : 'Crear proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
