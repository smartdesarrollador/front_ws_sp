import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useCreateEvent } from '../hooks/useCreateEvent'
import { useUpdateEvent } from '../hooks/useUpdateEvent'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import type { CalendarEvent, EventCategory } from '../types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../types'

const CATEGORIES: EventCategory[] = ['meeting', 'standup', 'client', 'review', 'personal']

const schema = z
  .object({
    title: z
      .string()
      .min(1, 'El título es requerido')
      .max(200, 'Máximo 200 caracteres'),
    start_date: z.string().min(1, 'La fecha de inicio es requerida'),
    end_date: z.string().min(1, 'La fecha de fin es requerida'),
    all_day: z.boolean().optional(),
    description: z.string().optional(),
    category: z.enum(['meeting', 'standup', 'client', 'review', 'personal'] as const),
    location: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.start_date || !data.end_date) return true
      return data.end_date >= data.start_date
    },
    { message: 'La fecha de fin debe ser igual o posterior a la de inicio', path: ['end_date'] },
  )

type FormData = z.infer<typeof schema>

interface Props {
  event?: CalendarEvent | null
  open: boolean
  onClose: () => void
  defaultDate?: string
}

export function EventModal({ event, open, onClose, defaultDate }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, open)
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()

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
      title: '',
      start_date: '',
      end_date: '',
      all_day: false,
      description: '',
      category: 'meeting',
      location: '',
    },
  })

  const selectedCategory = watch('category')

  useEffect(() => {
    if (open) {
      if (event) {
        reset({
          title: event.title,
          start_date: event.start_date,
          end_date: event.end_date,
          all_day: event.all_day,
          description: event.description ?? '',
          category: event.category,
          location: event.location ?? '',
        })
      } else {
        const now = new Date()
        const pad = (n: number) => String(n).padStart(2, '0')
        const datePrefix =
          defaultDate ??
          `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
        reset({
          title: '',
          start_date: `${datePrefix}T09:00`,
          end_date: `${datePrefix}T10:00`,
          all_day: false,
          description: '',
          category: 'meeting',
          location: '',
        })
      }
    }
  }, [open, event, defaultDate, reset])

  const onSubmit = (data: FormData) => {
    const { start_date, end_date, ...rest } = data
    const payload = {
      ...rest,
      start_date,
      end_date,
      color: CATEGORY_COLORS[data.category],
    }
    if (event) {
      updateEvent.mutate({ id: event.id, ...payload }, { onSuccess: onClose })
    } else {
      createEvent.mutate(payload, { onSuccess: onClose })
    }
  }

  const isPending = createEvent.isPending || updateEvent.isPending
  const error = createEvent.error || updateEvent.error

  const getErrorMessage = () => {
    if (!error) return null
    if ((error as { response?: { status?: number } }).response?.status === 402) {
      return 'Has alcanzado el límite de eventos de tu plan'
    }
    return 'Ocurrió un error. Intenta de nuevo.'
  }

  const errorMessage = getErrorMessage()

  const inputClass =
    'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500'

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-modal-title"
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="event-modal-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            {event ? 'Editar Evento' : 'Nuevo Evento'}
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

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título *
            </label>
            <input
              {...register('title')}
              placeholder="Ej: Sprint Planning Q1"
              className={inputClass}
            />
            {errors.title && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* All day checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="all_day"
              {...register('all_day')}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="all_day" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Todo el día
            </label>
          </div>

          {/* Start date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha inicio *
            </label>
            <input
              type="datetime-local"
              {...register('start_date')}
              className={inputClass}
            />
            {errors.start_date && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                {errors.start_date.message}
              </p>
            )}
          </div>

          {/* End date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha fin *
            </label>
            <input
              type="datetime-local"
              {...register('end_date')}
              className={inputClass}
            />
            {errors.end_date && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                {errors.end_date.message}
              </p>
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
              placeholder="Describe los detalles del evento..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoría
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const color = CATEGORY_COLORS[cat]
                const isSelected = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setValue('category', cat)}
                    className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      isSelected
                        ? 'shadow-sm border-current'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    style={{
                      color: isSelected ? color : undefined,
                      backgroundColor: isSelected ? color + '15' : undefined,
                    }}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                )
              })}
            </div>
            <input type="hidden" {...register('category')} />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ubicación
            </label>
            <input
              type="text"
              {...register('location')}
              placeholder="Ej: Sala de Conferencias A, Zoom"
              className={inputClass}
            />
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
              {event ? 'Guardar cambios' : 'Crear Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
