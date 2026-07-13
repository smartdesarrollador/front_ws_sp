import { useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Pin } from 'lucide-react'
import { useCreateNote } from '../hooks/useCreateNote'
import { useUpdateNote } from '../hooks/useUpdateNote'
import { useNoteTagSuggestions } from '../hooks/useNoteTagSuggestions'
import { useCategories } from '../hooks/useCategories'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { TagInput } from './TagInput'
import type { Note } from '../types'

const schema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200, 'Máximo 200 caracteres'),
  content: z.string().min(1, 'El contenido es requerido').max(10000, 'Máximo 10000 caracteres'),
  category: z.string().optional(),
  tags: z.array(z.string()),
  is_pinned: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  note?: Note | null
  open: boolean
  onClose: () => void
}

export function NoteModal({ note, open, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, open)
  const createNote = useCreateNote()
  const updateNote = useUpdateNote()
  const { data: tagSuggestions } = useNoteTagSuggestions()
  const { data: categories = [] } = useCategories()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      content: '',
      category: '',
      tags: [],
      is_pinned: false,
    },
  })

  useEffect(() => {
    if (open) {
      reset(
        note
          ? {
              title: note.title,
              content: note.content,
              category: note.category?.id ?? '',
              tags: note.tags,
              is_pinned: note.is_pinned,
            }
          : {
              title: '',
              content: '',
              category: '',
              tags: [],
              is_pinned: false,
            },
      )
    }
  }, [open, note, reset])

  const onSubmit = (data: FormData) => {
    const payload = {
      title: data.title,
      content: data.content,
      category: data.category || null,
      tags: data.tags,
      is_pinned: data.is_pinned ?? false,
    }

    if (note) {
      updateNote.mutate({ id: note.id, ...payload }, { onSuccess: onClose })
    } else {
      createNote.mutate(payload, { onSuccess: onClose })
    }
  }

  const isPending = createNote.isPending || updateNote.isPending
  const error = createNote.error || updateNote.error

  const getErrorMessage = () => {
    if (!error) return null
    if ((error as { response?: { status?: number } }).response?.status === 402) {
      return 'Has alcanzado el límite de notas de tu plan'
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
        aria-labelledby="note-modal-title"
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="note-modal-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            {note ? 'Editar nota' : 'Nueva nota'}
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
              placeholder="Título de la nota"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.title && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contenido *
            </label>
            <textarea
              {...register('content')}
              rows={4}
              placeholder="Escribe el contenido de tu nota..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
            {errors.content && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.content.message}</p>
            )}
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría
              </label>
              <select
                {...register('category')}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Etiquetas
              </label>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <TagInput
                    value={field.value ?? []}
                    onChange={field.onChange}
                    suggestions={tagSuggestions ?? []}
                    placeholder="Escribir etiqueta..."
                  />
                )}
              />
            </div>
          </div>

          {/* Pin checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_pinned"
              {...register('is_pinned')}
              className="rounded border-gray-300 dark:border-gray-600 text-primary-600"
            />
            <label
              htmlFor="is_pinned"
              className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              <Pin className="w-4 h-4 text-yellow-500" />
              Fijar nota
            </label>
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
              {note ? 'Guardar cambios' : 'Crear nota'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
